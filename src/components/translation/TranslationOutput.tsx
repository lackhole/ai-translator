import React, { useState } from 'react';
import TranslatorOutput from './TranslatorOutput';
import { translatorTypes, createTranslator } from '../../services/translatorRegistry';
import { Translation, Translator } from '../../types';

interface TranslationOutputProps {
  translations: Record<string, Translation>;
  translators: Translator[];
  onUpdateTranslators: React.Dispatch<React.SetStateAction<Translator[]>>;
  targetLanguage: string;
  setTargetLanguage: React.Dispatch<React.SetStateAction<string>>;
  handleTranslate: (text: string, translatorId: string, targetLanguage?: string) => void;
  sourceText: string;
  useKeywords?: boolean;
  setUseKeywords?: React.Dispatch<React.SetStateAction<boolean>>;
}

function highlightKeywords(text: string, keywordMeanings?: [string, string][]): string {
  if (!text || !keywordMeanings || keywordMeanings.length === 0) return text;

  let highlightedText = text;
  // Sort by length (longest first) to prevent nested replacements
  const sortedKeywords = keywordMeanings
    .map(([_, ko]) => ko)
    .sort((a, b) => b.length - a.length);

  sortedKeywords.forEach(koText => {
    const regex = new RegExp(koText, 'g');
    highlightedText = highlightedText.replace(regex, `<span class="highlight-out">${koText}</span>`);
  });

  return highlightedText;
}

const TranslationOutput: React.FC<TranslationOutputProps> = ({ 
  translations, 
  targetLanguage, 
  setTargetLanguage, 
  handleTranslate, 
  sourceText,
  translators,
  onUpdateTranslators,
  useKeywords,
  setUseKeywords
}) => {
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);

  const handleModelChange = (translatorId: string, newConfig: any): void => {
    const updatedTranslators = translators.map(translator => {
      if (translator.id === translatorId) {
        return translator.updateConfig(newConfig);
      }
      return translator;
    });
    onUpdateTranslators(updatedTranslators);
  };

  const handleDeleteTranslator = (translatorId: string): void => {
    const updatedTranslators = translators.filter(translator => translator.id !== translatorId);
    onUpdateTranslators(updatedTranslators);
  };

  const handleAddTranslator = (translatorType: string): void => {
    const newTranslator = createTranslator(translatorType);
    onUpdateTranslators([...translators, newTranslator]);
    setShowAddMenu(false);
  };

  return (
    <div className="translation-outputs">
      {translators.map(translator => (
        <TranslatorOutput
          key={translator.id}
          translator={translator}
          translation={translations[translator.id] || { text: '', isLoading: false }}
          onDelete={handleDeleteTranslator}
          onModelChange={handleModelChange}
        />
      ))}

      <div className="add-translator-container">
        {showAddMenu ? (
          <div className="translator-types-menu">
            <h4>Add Translator</h4>
            <div className="translator-types-list">
              {translatorTypes.map(type => (
                <button
                  key={type.id}
                  className="add-translator-type-button"
                  onClick={() => handleAddTranslator(type.id)}
                >
                  {type.name}
                </button>
              ))}
            </div>
            <button 
              className="cancel-button" 
              onClick={() => setShowAddMenu(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            className="add-translator-button"
            onClick={() => setShowAddMenu(true)}
          >
            + Add Translator
          </button>
        )}
      </div>
    </div>
  );
};

export { highlightKeywords };
export default TranslationOutput; 