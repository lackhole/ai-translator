import React, { useState } from 'react';
import { Translator, Translation } from '../../types';
import { highlightKeywords } from './TranslationOutput';

interface TranslatorOutputProps {
  translator: Translator;
  translation: Translation;
  onDelete: (id: string) => void;
  onModelChange?: (id: string, config: {model: string | null}) => void;
}

const TranslatorOutput: React.FC<TranslatorOutputProps> = ({ 
  translator, 
  translation, 
  onDelete,
  onModelChange
}) => {
  const [config, setConfig] = useState<{model: string | null}>({
    model: translator.config.model || null
  });

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newConfig = { ...config, model: e.target.value };
    setConfig(newConfig);
    if (onModelChange) {
      onModelChange(translator.id, newConfig);
    }
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
              __html: highlightKeywords(translation.text, translation.keywordMeanings) 
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default TranslatorOutput; 