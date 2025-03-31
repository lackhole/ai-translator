import { useState, useEffect } from 'react';
import { createTranslator } from '../services/translatorRegistry';
import { translateWithKeywords } from '../services/keywordService';
import { 
  KeywordTranslation, 
  Translation, 
  Translator, 
  EditingCell 
} from '../types';

interface UseTranslationReturn {
  sourceText: string;
  setSourceText: React.Dispatch<React.SetStateAction<string>>;
  targetLanguage: string;
  setTargetLanguage: React.Dispatch<React.SetStateAction<string>>;
  inputLanguage: string;
  setInputLanguage: React.Dispatch<React.SetStateAction<string>>;
  translations: Record<string, Translation>;
  translators: Translator[];
  setTranslators: React.Dispatch<React.SetStateAction<Translator[]>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  handleTranslate: (text: string, translatorId?: string, targetLang?: string) => Promise<void>;
  handleCellDoubleClick: (key: string, lang: string, cnsText?: string) => EditingCell;
}

export function useTranslation(
  keywordTranslations?: Map<string, KeywordTranslation>,
  useKeywords?: boolean
): UseTranslationReturn {
  const [sourceText, setSourceText] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('ko');
  const [inputLanguage, setInputLanguage] = useState<string>('auto');
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [translations, setTranslations] = useState<Record<string, Translation>>({});
  const [error, setError] = useState<string>('');

  // Initialize with default translators
  useEffect(() => {
    if (translators.length === 0) {
      setTranslators([
        createTranslator('openai'),
        createTranslator('google')
      ]);
    }
  }, [translators.length]);

  const getKeywordMeanings = (text: string): [string, string][] => {
    if (!keywordTranslations) return [];
    
    const matches = new Map<string, string>();
    keywordTranslations.forEach((value, key) => {
      const cnsText = value.translations.get('cns');
      const koText = value.translations.get('ko');
      if (cnsText && koText && text.includes(cnsText)) {
        matches.set(cnsText, koText);
      }
    });
    return Array.from(matches.entries());
  };

  const handleTranslate = async (text: string, translatorId: string = 'all'): Promise<void> => {
    if (!text.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setError('');
    
    // Determine which translators to use
    const translatorsToUse = translatorId === 'all'
      ? translators
      : translators.filter(t => t.id === translatorId);
    
    if (translatorsToUse.length === 0) {
      setError(`Translator ${translatorId} not found`);
      return;
    }
    
    // Set loading state for selected translators
    setTranslations(prev => {
      const updated = { ...prev };
      translatorsToUse.forEach(translator => {
        updated[translator.id] = { 
          ...(updated[translator.id] || {}), 
          isLoading: true,
          text: updated[translator.id]?.text || ''
        };
      });
      return updated;
    });

    try {
      let textToTranslate = text;
      const keywordMeanings = getKeywordMeanings(text);
      
      // Apply keyword translations if enabled
      if (keywordTranslations && keywordTranslations.size > 0 && useKeywords) {
        textToTranslate = translateWithKeywords(text, keywordTranslations, targetLanguage);
      }

      // Start translations for each selected translator
      translatorsToUse.forEach(translator => {
        translator.translate(textToTranslate, targetLanguage, keywordMeanings)
          .then(result => {
            setTranslations(prev => {
              const text = typeof result === 'string' ? result : result.text;
              const meanings = typeof result === 'string' ? keywordMeanings : (result.keywordMeanings || keywordMeanings);
              
              return {
                ...prev,
                [translator.id]: {
                  text,
                  isLoading: false,
                  keywordMeanings: meanings
                }
              };
            });
          })
          .catch(err => {
            console.error(`${translator.name} translation error:`, err);
            setTranslations(prev => ({
              ...prev,
              [translator.id]: { 
                ...(prev[translator.id] || {}), 
                isLoading: false,
                text: prev[translator.id]?.text || ''
              }
            }));
            setError(prev => prev || `${translator.name} translation failed: ${err.message}`);
          });
      });
    } catch (err: any) {
      setError(err.message);
      setTranslations(prev => {
        const updated = { ...prev };
        translatorsToUse.forEach(translator => {
          updated[translator.id] = { 
            ...(updated[translator.id] || {}), 
            isLoading: false,
            text: updated[translator.id]?.text || ''
          };
        });
        return updated;
      });
    }
  };

  // Function to translate on cell double click
  const handleCellDoubleClick = (key: string, lang: string, cnsText?: string): EditingCell => {
    // If clicking any cell except CNS, translate the CNS text
    if (lang !== 'cns' && cnsText) {
      setSourceText(cnsText);
      
      // Get keyword meanings for the text
      const keywordMeanings = getKeywordMeanings(cnsText);
      
      // Use the text directly for translation
      const textToTranslate = keywordTranslations && keywordTranslations.size > 0 && useKeywords
        ? translateWithKeywords(cnsText, keywordTranslations, targetLanguage)
        : cnsText;

      setError('');
      
      // Set loading state for all translators
      setTranslations(prev => {
        const updated = { ...prev };
        translators.forEach(translator => {
          updated[translator.id] = { text: '', isLoading: true };
        });
        return updated;
      });

      // Start translations for each translator
      translators.forEach(translator => {
        translator.translate(textToTranslate, targetLanguage, keywordMeanings)
          .then(result => {
            setTranslations(prev => {
              const text = typeof result === 'string' ? result : result.text;
              const meanings = typeof result === 'string' ? keywordMeanings : (result.keywordMeanings || keywordMeanings);
              
              return {
                ...prev,
                [translator.id]: {
                  text,
                  isLoading: false,
                  keywordMeanings: meanings
                }
              };
            });
          })
          .catch(err => {
            console.error(`${translator.name} translation error:`, err);
            setTranslations(prev => ({
              ...prev,
              [translator.id]: { 
                ...(prev[translator.id] || {}), 
                isLoading: false,
                text: prev[translator.id]?.text || ''
              }
            }));
            setError(prev => prev || `${translator.name} translation failed: ${err.message}`);
          });
      });
    }
    
    return { id: key, lang };
  };

  return {
    sourceText,
    setSourceText,
    targetLanguage,
    setTargetLanguage,
    inputLanguage,
    setInputLanguage,
    translations,
    translators,
    setTranslators,
    error,
    setError,
    handleTranslate,
    handleCellDoubleClick
  };
} 