import React from 'react';

function KeywordTable({
  displayedKeywords,
  sortConfig,
  editingCell,
  handleSort,
  handleCellDoubleClick,
  handleEditSubmit,
  handleEditCancel,
  handleDeleteKeyword,
  isSorting
}) {
  return (
    <div className="keyword-table">
      <div className="keyword-table-header">
        <div 
          className="column-file"
          onClick={() => handleSort('file')}
        >
          File
          {sortConfig.key === 'file' && (
            <span className={`sort-indicator ${isSorting ? 'sorting' : ''}`}>
              {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
            </span>
          )}
        </div>
        <div 
          className="column-id"
          onClick={() => handleSort('id')}
        >
          ID
          {sortConfig.key === 'id' && (
            <span className={`sort-indicator ${isSorting ? 'sorting' : ''}`}>
              {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
            </span>
          )}
        </div>
        <div 
          className="column-cns"
          onClick={() => handleSort('cns')}
        >
          cns
          {sortConfig.key === 'cns' && (
            <span className={`sort-indicator ${isSorting ? 'sorting' : ''}`}>
              {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
            </span>
          )}
        </div>
        <div 
          className="column-ko"
          onClick={() => handleSort('ko')}
        >
          ko
          {sortConfig.key === 'ko' && (
            <span className={`sort-indicator ${isSorting ? 'sorting' : ''}`}>
              {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
            </span>
          )}
        </div>
        <div className="column-actions">
          Actions
        </div>
      </div>
      <div className="keyword-table-body">
        {displayedKeywords.map(([key, value]) => (
          <div key={key} className="keyword-row">
            <div 
              className="column-file"
              onDoubleClick={() => value.isCustom && handleCellDoubleClick(key, 'file')}
            >
              {editingCell?.id === key && editingCell?.lang === 'file' ? (
                <input
                  type="text"
                  className="edit-translation"
                  defaultValue={value.sourceFile || ''}
                  autoFocus
                  onBlur={(e) => handleEditSubmit(key, 'file', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditSubmit(key, 'file', e.target.value);
                    } else if (e.key === 'Escape') {
                      handleEditCancel(e);
                    }
                  }}
                />
              ) : (
                <span className={`editable-cell ${value.isCustom ? 'editable' : ''}`}>
                  {value.sourceFile || 'custom'}
                </span>
              )}
            </div>
            <div 
              className="column-id"
              onDoubleClick={() => handleCellDoubleClick(key, 'id', value.translations.get('cns') || '')}
            >
              {key}
            </div>
            <div 
              className="column-cns"
              onDoubleClick={() => handleCellDoubleClick(key, 'cns')}
            >
              {editingCell?.id === key && editingCell?.lang === 'cns' ? (
                <input
                  type="text"
                  className="edit-translation"
                  defaultValue={value.translations.get('cns') || ''}
                  autoFocus
                  onBlur={(e) => handleEditSubmit(key, 'cns', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditSubmit(key, 'cns', e.target.value);
                    } else if (e.key === 'Escape') {
                      handleEditCancel(e);
                    }
                  }}
                />
              ) : (
                <span className="editable-cell">
                  {value.translations.get('cns') || ''}
                </span>
              )}
            </div>
            <div 
              className="column-ko"
              onDoubleClick={() => handleCellDoubleClick(key, 'ko', value.translations.get('cns') || '')}
            >
              {editingCell?.id === key && editingCell?.lang === 'ko' ? (
                <input
                  type="text"
                  className="edit-translation"
                  defaultValue={value.translations.get('ko') || ''}
                  autoFocus
                  onBlur={(e) => handleEditSubmit(key, 'ko', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditSubmit(key, 'ko', e.target.value);
                    } else if (e.key === 'Escape') {
                      handleEditCancel(e);
                    }
                  }}
                />
              ) : (
                <span className="editable-cell">
                  {value.translations.get('ko') || ''}
                </span>
              )}
            </div>
            <div 
              className="column-actions"
              onDoubleClick={() => handleCellDoubleClick(key, 'actions', value.translations.get('cns') || '')}
            >
              <button
                className="delete-button"
                onClick={() => handleDeleteKeyword(key)}
                title="Delete keyword"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KeywordTable; 