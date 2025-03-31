import { useState, useEffect } from 'react';
import { createTranslator } from '../services/translatorRegistry';
import { translateWithKeywords } from '../services/keywordService';

export function useTranslation(keywordTranslations, useKeywords) {
  const [sourceText, setSourceText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('ko');
  const [inputLanguage, setInputLanguage] = useState('auto');
  const [translators, setTranslators] = useState([]);
  const [translations, setTranslations] = useState({});
  const [error, setError] = useState('');

  // Initialize with default translators
  useEffect(() => {
    if (translators.length === 0) {
      setTranslators([
        createTranslator('openai'),
        createTranslator('google')
      ]);
    }
  }, [translators.length]);

  const getKeywordMeanings = (text) => {
    const matches = new Map();
    keywordTranslations.forEach((value, key) => {
      const cnsText = value.translations.get('cns');
      const koText = value.translations.get('ko');
      if (cnsText && koText && text.includes(cnsText)) {
        matches.set(cnsText, koText);
      }
    });
    return Array.from(matches.entries());
  };

  const handleTranslate = async (text, translatorId = 'all') => {
    if (!text.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setError(null);
    
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
          isLoading: true 
        };
      });
      return updated;
    });

    try {
      let textToTranslate = text;
      const keywordMeanings = getKeywordMeanings(text);
      
      // Apply keyword translations if enabled
      if (keywordTranslations.size > 0 && useKeywords) {
        textToTranslate = translateWithKeywords(text, keywordTranslations, targetLanguage);
      }

      // Start translations for each selected translator
      translatorsToUse.forEach(translator => {
        translator.translate(textToTranslate, targetLanguage, keywordMeanings, inputLanguage)
          .then(result => {
            setTranslations(prev => ({
              ...prev,
              [translator.id]: {
                text: result.text || result,
                isLoading: false,
                keywordMeanings: result.keywordMeanings || keywordMeanings
              }
            }));
          })
          .catch(err => {
            console.error(`${translator.name} translation error:`, err);
            setTranslations(prev => ({
              ...prev,
              [translator.id]: { 
                ...(prev[translator.id] || {}), 
                isLoading: false 
              }
            }));
            setError(prev => prev || `${translator.name} translation failed: ${err.message}`);
          });
      });
    } catch (err) {
      setError(err.message);
      setTranslations(prev => {
        const updated = { ...prev };
        translatorsToUse.forEach(translator => {
          updated[translator.id] = { 
            ...(updated[translator.id] || {}), 
            isLoading: false 
          };
        });
        return updated;
      });
    }
  };

  // Function to translate on cell double click
  const handleCellDoubleClick = (key, lang, cnsText) => {
    // If clicking any cell except CNS, translate the CNS text
    if (lang !== 'cns' && cnsText) {
      setSourceText(cnsText);
      
      // Get keyword meanings for the text
      const keywordMeanings = getKeywordMeanings(cnsText);
      
      // Use the text directly for translation
      const textToTranslate = keywordTranslations.size > 0 && useKeywords
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
        translator.translate(textToTranslate, targetLanguage, keywordMeanings, inputLanguage)
          .then(result => {
            setTranslations(prev => ({
              ...prev,
              [translator.id]: {
                text: result.text || result,
                isLoading: false,
                keywordMeanings: result.keywordMeanings || keywordMeanings
              }
            }));
          })
          .catch(err => {
            console.error(`${translator.name} translation error:`, err);
            setTranslations(prev => ({
              ...prev,
              [translator.id]: { 
                ...(prev[translator.id] || {}), 
                isLoading: false 
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