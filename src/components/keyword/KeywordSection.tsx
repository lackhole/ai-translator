import React from 'react';
import KeywordHeader from './KeywordHeader';
import KeywordTable from './KeywordTable';
import { KeywordSectionProps } from '../../types';

const KeywordSection: React.FC<KeywordSectionProps> = ({
  keywordTranslations,
  displayedKeywords,
  sortConfig,
  isSorting,
  editingCell,
  handleSort,
  handleCellDoubleClick,
  handleEditSubmit,
  handleEditCancel,
  handleDeleteKeyword,
  handleExportTranslations,
  handleClearTranslations,
  handleAddCustomKeyword
}) => {
  return (
    <div className="keyword-section">
      <KeywordHeader 
        keywordCount={keywordTranslations.size}
        handleExportTranslations={handleExportTranslations}
        handleClearTranslations={handleClearTranslations}
        handleAddCustomKeyword={handleAddCustomKeyword}
      />
      <KeywordTable 
        displayedKeywords={displayedKeywords}
        sortConfig={sortConfig}
        isSorting={isSorting}
        editingCell={editingCell}
        handleSort={handleSort}
        handleCellDoubleClick={handleCellDoubleClick}
        handleEditSubmit={handleEditSubmit}
        handleEditCancel={handleEditCancel}
        handleDeleteKeyword={handleDeleteKeyword}
      />
    </div>
  );
};

export default KeywordSection; 