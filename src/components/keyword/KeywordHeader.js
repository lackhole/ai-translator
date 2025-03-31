import React from 'react';

function KeywordHeader({ 
  keywordCount, 
  handleExportTranslations, 
  handleClearTranslations,
  handleAddCustomKeyword
}) {
  return (
    <div className="keyword-header">
      <div className="keyword-info">
        Loaded {keywordCount} keyword translations
      </div>
      <div className="keyword-actions">
        <button 
          className="add-keyword-button"
          onClick={handleAddCustomKeyword}
          title="Add a custom keyword"
        >
          Add Custom Keyword
        </button>
        <button 
          className="export-button"
          onClick={handleExportTranslations}
          title="Export Korean translations"
        >
          Export Translations
        </button>
        <button 
          className="clear-button"
          onClick={handleClearTranslations}
        >
          Clear Translations
        </button>
      </div>
    </div>
  );
}

export default KeywordHeader; 