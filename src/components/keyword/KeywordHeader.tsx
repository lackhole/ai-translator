import React from 'react';

interface KeywordHeaderProps {
  keywordCount: number;
  handleExportTranslations: () => void;
  handleClearTranslations: () => void;
  handleAddCustomKeyword: () => void;
}

const KeywordHeader: React.FC<KeywordHeaderProps> = ({
  keywordCount,
  handleExportTranslations,
  handleClearTranslations,
  handleAddCustomKeyword
}) => {
  return (
    <div className="keyword-header">
      <h2>Keywords ({keywordCount})</h2>
      <div className="keyword-actions">
        <button 
          className="add-custom-keyword-button" 
          onClick={handleAddCustomKeyword}
        >
          Add Custom Keyword
        </button>
        <button 
          className="export-button" 
          onClick={handleExportTranslations}
        >
          Export Translations
        </button>
        <button 
          className="clear-button" 
          onClick={handleClearTranslations}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default KeywordHeader; 