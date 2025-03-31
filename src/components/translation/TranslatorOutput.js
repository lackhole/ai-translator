import React, { useState } from 'react';

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

function TranslatorOutput({ 
  translator, 
  onDelete,
  onUpdateConfig,
  translation, 
  targetLanguage,
  setTargetLanguage,
  handleTranslate,
  sourceText
}) {
  const [config, setConfig] = useState(translator.config || {});

  const handleModelChange = (e) => {
    const newConfig = { ...config, model: e.target.value };
    setConfig(newConfig);
    onUpdateConfig(translator.id, newConfig);
  };

  return (
    <div className="translation-output-box">
      <div className="translation-header">
        <h3>{translator.name}</h3>
        <div className="translation-controls">
          {translator.hasModelSelection && translator.models && translator.models.length > 0 && (
            <select
              className="model-select"
              value={config.model || ''}
              onChange={handleModelChange}
            >
              {translator.models.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          )}
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="language-select"
          >
            <option value="ko">Korean</option>
            <option value="cns">Chinese</option>
          </select>
          <button 
            onClick={() => handleTranslate(sourceText, translator.id)} 
            className="translate-button"
          >
            Translate
          </button>
          <button 
            onClick={() => onDelete(translator.id)}
            className="delete-translator-button"
          >
            ×
          </button>
        </div>
      </div>
      <div className="translation-output">
        {translation.isLoading ? (
          <div className="loading-indicator">Translating...</div>
        ) : (
          <div 
            dangerouslySetInnerHTML={{ 
              __html: highlightKeywords(translation.text, translation.keywordMeanings || []) 
            }} 
          />
        )}
      </div>
    </div>
  );
}

export default TranslatorOutput; 