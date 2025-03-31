import { KeywordTranslation, UpdateStats } from '../types';

const STORAGE_KEY = 'mb_translator_keywords';

interface ParsedTranslation {
  key: string;
  translation: string;
}

export const parseTranslationLine = (line: string): ParsedTranslation | null => {
  if (!line.trim()) return null;
  
  const [key, translation] = line.split('|').map(part => part.trim());
  if (!key || !translation) return null;
  
  return { key, translation };
};

export const loadTranslationFile = async (file: File): Promise<Map<string, KeywordTranslation>> => {
  try {
    const text = await file.text();
    const lines = text.split('\n');
    const translations = new Map<string, KeywordTranslation>();
    
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
          translations: new Map<string, string>(),
          file: sourceFile
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

export const loadTranslationsFromStorage = (): Map<string, KeywordTranslation> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Map();
    
    const parsed = JSON.parse(stored);
    // Convert the stored object back to a Map with nested Maps for translations
    return new Map(Object.entries(parsed).map(([key, value]: [string, any]) => [
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

export const saveTranslationsToStorage = (translations: Map<string, KeywordTranslation>): void => {
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

export const translateWithKeywords = (
  text: string, 
  keywordTranslations: Map<string, KeywordTranslation>, 
  targetLanguage: string
): string => {
  let translatedText = text;
  
  // Sort keywords by length (longest first) to handle overlapping keywords
  const sortedKeywords = Array.from(keywordTranslations.entries())
    .filter(([_, value]) => value.translations.has('cns') && value.translations.has(targetLanguage))
    .map(([_, value]) => value.translations.get('cns') as string)
    .sort((a, b) => b.length - a.length);
  
  sortedKeywords.forEach(keyword => {
    // Convert entries to array first to avoid iterator issues
    const entries = Array.from(keywordTranslations.entries());
    for (let i = 0; i < entries.length; i++) {
      const [id, entry] = entries[i];
      if (entry.translations.get('cns') === keyword) {
        const translation = entry.translations.get(targetLanguage);
        if (translation) {
          const regex = new RegExp(keyword, 'g');
          translatedText = translatedText.replace(regex, translation);
        }
        break;
      }
    }
  });
  
  return translatedText;
};

export const getCategories = (translations: Map<string, KeywordTranslation>): string[] => {
  const categories = new Set<string>();
  translations.forEach((value) => {
    if (value.file) {
      categories.add(value.file);
    }
  });
  return Array.from(categories).sort();
};

export const getTranslationsByCategory = (
  translations: Map<string, KeywordTranslation>, 
  category: string
): Map<string, KeywordTranslation> => {
  const filtered = new Map<string, KeywordTranslation>();
  translations.forEach((value, key) => {
    if (value.file === category) {
      filtered.set(key, value);
    }
  });
  return filtered;
};

export const getTranslationsByLanguage = (
  translations: Map<string, KeywordTranslation>, 
  language: string
): Map<string, KeywordTranslation> => {
  return new Map(
    Array.from(translations.entries())
      .filter(([_, value]) => value.translations.has(language))
  );
}; 