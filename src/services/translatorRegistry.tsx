import { translateWithOpenAI, translateWithGoogle } from './translationService';
import { TranslatorType, Translator } from '../types';

// Available translator types
export const translatorTypes: TranslatorType[] = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'google', name: 'Google Translate' }
];

interface OpenAITranslator extends Translator {
  type: 'openai';
  config: {
    model: string;
  };
}

interface GoogleTranslator extends Translator {
  type: 'google';
  config: {
    model: null;
  };
}

// Factory function to create translator instances
export const createTranslator = (translatorType: string): Translator => {
  switch (translatorType) {
    case 'openai': {
      const translator: OpenAITranslator = {
        id: `openai_${Date.now()}`,
        type: 'openai',
        name: 'OpenAI',
        config: { model: 'gpt-3.5-turbo' },
        models: [
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
          { id: 'gpt-4', name: 'GPT-4' }
        ],
        hasModelSelection: true,
        translate: async (text: string, targetLanguage: string, keywordMeanings: [string, string][], inputLanguage?: string) => {
          return translateWithOpenAI(text, targetLanguage, keywordMeanings, translator.config.model, inputLanguage);
        },
        updateConfig: (config: any) => {
          return { ...translator, config } as Translator;
        }
      };
      return translator;
    }
    
    case 'google': {
      const translator: GoogleTranslator = {
        id: `google_${Date.now()}`,
        type: 'google',
        name: 'Google Translate',
        config: { model: null },
        models: [],
        hasModelSelection: false,
        translate: async (text: string, targetLanguage: string, keywordMeanings: [string, string][], inputLanguage?: string) => {
          const result = await translateWithGoogle(text, targetLanguage, inputLanguage);
          return { text: result };
        },
        updateConfig: (config: any) => {
          return { ...translator, config } as Translator;
        }
      };
      return translator;
    }
      
    default:
      throw new Error(`Unknown translator type: ${translatorType}`);
  }
}; 