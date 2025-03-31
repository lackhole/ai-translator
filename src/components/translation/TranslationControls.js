import React from 'react';

function TranslationControls({ 
  useKeywords, 
  setUseKeywords,
  targetLanguage,
  setTargetLanguage,
  handleTranslate
}) {
  return (
    <div className="translation-controls">
      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={useKeywords}
            onChange={(e) => setUseKeywords(e.target.checked)}
          />
          Use keyword bank
        </label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="language-select"
        >
          <option value="ko">Korean</option>
          <option value="cns">Chinese</option>
        </select>
        <button onClick={handleTranslate} className="translate-button">
          Translate
        </button>
      </div>
    </div>
  );
}

export default TranslationControls; 