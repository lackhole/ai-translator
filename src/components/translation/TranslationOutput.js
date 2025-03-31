import React, { useState } from 'react';
import TranslatorOutput from './TranslatorOutput';
import { translatorTypes, createTranslator } from '../../services/translatorRegistry';

function highlightKeywords(text, keywordMeanings) {
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

function TranslationOutput({ 
  translations, 
  targetLanguage, 
  setTargetLanguage, 
  handleTranslate, 
  sourceText,
  translators,
  onUpdateTranslators 
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleUpdateConfig = (translatorId, newConfig) => {
    const updatedTranslators = translators.map(translator => {
      if (translator.id === translatorId) {
        return {
          ...translator,
          config: newConfig
        };
      }
      return translator;
    });
    onUpdateTranslators(updatedTranslators);
  };

  const handleDeleteTranslator = (translatorId) => {
    const updatedTranslators = translators.filter(translator => translator.id !== translatorId);
    onUpdateTranslators(updatedTranslators);
  };

  const handleAddTranslator = (translatorType) => {
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
          onDelete={handleDeleteTranslator}
          onUpdateConfig={handleUpdateConfig}
          translation={translations[translator.id] || { text: '', isLoading: false }}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          handleTranslate={handleTranslate}
          sourceText={sourceText}
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
}

export default TranslationOutput; 