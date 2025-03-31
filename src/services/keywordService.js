const STORAGE_KEY = 'mb_translator_keywords';

export const parseTranslationLine = (line) => {
  if (!line.trim()) return null;
  
  const [key, translation] = line.split('|').map(part => part.trim());
  if (!key || !translation) return null;
  
  return { key, translation };
};

export const loadTranslationFile = async (file) => {
  try {
    const text = await file.text();
    const lines = text.split('\n');
    const translations = new Map();
    
    // Extract category and language from filename
    // e.g., "cns/troops.csv" -> category: "cns", language: "cns"
    // e.g., "en/troops.csv" -> category: "en", language: "ko"
    const pathParts = file.name.split('/');
    const category = pathParts[0] || 'default';
    const language = category === 'en' ? 'ko' : category;
    const sourceFile = pathParts[1] || file.name;
    
    console.log('Loading file:', file.name, 'Category:', category, 'Language:', language);
    
    lines.forEach(line => {
      const parsed = parseTranslationLine(line);
      if (parsed) {
        const existingEntry = translations.get(parsed.key) || {
          translations: new Map(),
          category,
          sourceFile
        };
        
        // Add or update the translation for this language
        existingEntry.translations.set(language, parsed.translation);
        translations.set(parsed.key, existingEntry);
      }
    });
    
    return translations;
  } catch (error) {
    console.error('Error loading translation file:', error);
    throw new Error('Failed to load translation file');
  }
};

export const loadTranslationsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Map();
    
    const parsed = JSON.parse(stored);
    // Convert the stored object back to a Map with nested Maps for translations
    return new Map(Object.entries(parsed).map(([key, value]) => [
      key,
      {
        ...value,
        translations: new Map(Object.entries(value.translations))
      }
    ]));
  } catch (error) {
    console.error('Error loading translations from storage:', error);
    return new Map();
  }
};

export const saveTranslationsToStorage = (translations) => {
  try {
    // Convert the Map with nested Maps to a plain object for storage
    const serialized = JSON.stringify(Object.fromEntries(
      Array.from(translations.entries()).map(([key, value]) => [
        key,
        {
          ...value,
          translations: Object.fromEntries(value.translations)
        }
      ])
    ));
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Error saving translations to storage:', error);
  }
};

export const translateWithKeywords = (text, keywordTranslations, targetLanguage) => {
  let translatedText = text;
  
  // Sort keywords by length (longest first) to handle overlapping keywords
  const sortedKeywords = Array.from(keywordTranslations.keys())
    .sort((a, b) => b.length - a.length);
  
  sortedKeywords.forEach(keyword => {
    const entry = keywordTranslations.get(keyword);
    const translation = entry.translations.get(targetLanguage);
    if (translation) {
      const regex = new RegExp(keyword, 'g');
      translatedText = translatedText.replace(regex, translation);
    }
  });
  
  return translatedText;
};

export const getCategories = (translations) => {
  const categories = new Set();
  translations.forEach((value) => {
    if (value.sourceFile) {
      categories.add(value.sourceFile);
    }
  });
  return Array.from(categories).sort();
};

export const getTranslationsByCategory = (translations, category) => {
  const filtered = new Map();
  translations.forEach((value, key) => {
    if (value.sourceFile === category) {
      filtered.set(key, value);
    }
  });
  return filtered;
};

export const getTranslationsByLanguage = (translations, language) => {
  return new Map(
    Array.from(translations.entries())
      .filter(([_, value]) => value.translations.has(language))
  );
}; 