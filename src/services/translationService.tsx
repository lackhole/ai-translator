import OpenAI from 'openai';

interface LanguageMap {
  [provider: string]: {
    [code: string]: string;
  };
}

interface TranslationResult {
  text: string;
  keywordMeanings?: [string, string][];
}

const getOpenAIKey = (): string => {
  const key = localStorage.getItem('openai_api_key');
  if (!key) {
    throw new Error('OpenAI API key not found. Please enter your API key in the settings.');
  }
  return key;
};

const createOpenAIClient = () => {
  return new OpenAI({
    apiKey: getOpenAIKey(),
    dangerouslyAllowBrowser: true,
    fetch: (url: RequestInfo, init?: RequestInit) => {
      if (!init) return fetch(url);
      
      // Ensure headers are properly encoded
      const headers = new Headers(init.headers);
      return fetch(url, {
        ...init,
        headers
      });
    }
  });
};

const GOOGLE_TRANSLATE_API_URL = 'https://translate.googleapis.com/translate_a/single';

// Map UI language codes to API-specific language codes
const languageMap: LanguageMap = {
  // For OpenAI, we just use descriptive language names
  openai: {
    auto: 'auto-detect',
    cns: 'Chinese (Simplified)',
    ko: 'Korean'
  },
  // For Google Translate API
  google: {
    auto: '',  // Google auto-detects when empty
    cns: 'zh-CN',
    ko: 'ko'
  },
  // Naver Papago API
  papago: {
    auto: 'auto',
    cns: 'zh-CN',
    ko: 'ko'
  }
};

export const translateText = async (
  text: string, 
  targetLanguage: string, 
  provider: string = 'openai', 
  keywordMeanings: [string, string][] = [], 
  model: string = 'gpt-3.5-turbo', 
  inputLanguage: string = 'auto'
): Promise<string> => {
  try {
    if (provider === 'openai') {
      const openai = createOpenAIClient();
      let systemContent = `You are a professional translator who translates texts precisely. `;
      
      // Add source and target languages
      systemContent += `Translate from ${languageMap.openai[inputLanguage]} to ${targetLanguage === 'ko' ? 'Korean' : 'Chinese (Simplified)'}. `;
      
      if (keywordMeanings && keywordMeanings.length > 0) {
        systemContent += `For context, the following terms have these specific meanings:\n`;
        keywordMeanings.forEach(([term, meaning]) => {
          systemContent += `"${term}" means "${meaning}"\n`;
        });
        systemContent += `\nUse these meanings when translating.`;
      }
      
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: `Translate: ${text}` }
        ],
        temperature: 0.3,
      });
      
      if (!response.choices || response.choices.length === 0 || !response.choices[0].message) {
        throw new Error('Invalid response from OpenAI');
      }
      
      return response.choices[0].message.content?.trim() || '';
    } else if (provider === 'google') {
      const params = new URLSearchParams({
        client: 'gtx',
        sl: languageMap.google[inputLanguage] || 'auto',
        tl: targetLanguage,
        dt: 't',
        q: text
      });

      const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Google Translate request failed');
      }

      const data = await response.json();
      return data[0][0][0]; // The translated text is in the first element of the nested array
    } else {
      throw new Error('Unsupported translation provider');
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Failed to translate text using ${provider}. Please try again.`);
  }
};

export async function translateWithOpenAI(
  text: string, 
  targetLanguage: string, 
  keywordMeanings: [string, string][] = [], 
  model: string = 'gpt-3.5-turbo', 
  inputLanguage: string = 'auto'
): Promise<TranslationResult> {
  try {
    const result = await translateText(text, targetLanguage, 'openai', keywordMeanings, model, inputLanguage);
    return {
      text: result,
      keywordMeanings: keywordMeanings
    };
  } catch (error) {
    console.error('OpenAI translation error:', error);
    throw new Error('Failed to translate with OpenAI');
  }
}

export const translateWithGoogle = async (
  text: string, 
  targetLanguage: string, 
  inputLanguage: string = 'auto'
): Promise<string> => {
  return translateText(text, targetLanguage, 'google', [], 'gpt-3.5-turbo', inputLanguage);
};

export async function translateWithBothProviders(
  text: string, 
  targetLanguage: string, 
  keywordMeanings: [string, string][] = [], 
  model: string = 'gpt-3.5-turbo', 
  inputLanguage: string = 'auto'
): Promise<{ 
  openai: TranslationResult, 
  google: { text: string } 
}> {
  try {
    const [openaiResult, googleResult] = await Promise.all([
      translateWithOpenAI(text, targetLanguage, keywordMeanings, model, inputLanguage),
      translateWithGoogle(text, targetLanguage, inputLanguage)
    ]);

    return {
      openai: openaiResult,
      google: { text: googleResult }
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate with both providers');
  }
} 