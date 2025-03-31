import React, { useState, useRef, useEffect } from 'react';
import { KeywordTranslation, SortConfig, EditingCell } from '../../types';

interface KeywordTableProps {
  displayedKeywords: [string, KeywordTranslation][];
  sortConfig: SortConfig | null;
  isSorting: boolean;
  editingCell: EditingCell | null;
  handleSort: (key: string) => void;
  handleCellDoubleClick: (key: string, lang: string, cnsText: string) => void;
  handleEditSubmit: (key: string, lang: string, value: string) => void;
  handleEditCancel: () => void;
  handleDeleteKeyword: (key: string) => void;
}

const KeywordTable: React.FC<KeywordTableProps> = ({
  displayedKeywords,
  sortConfig,
  isSorting,
  editingCell,
  handleSort,
  handleCellDoubleClick,
  handleEditSubmit,
  handleEditCancel,
  handleDeleteKeyword
}) => {
  const [editValue, setEditValue] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing cell changes
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingCell]);

  // Set initial edit value when edit cell changes
  useEffect(() => {
    if (editingCell) {
      const [id, translation] = displayedKeywords.find(([key]) => key === editingCell.id) || ['', { translations: new Map() }];
      
      if (editingCell.lang === 'file') {
        setEditValue(translation.file || '');
      } else {
        setEditValue(translation.translations.get(editingCell.lang) || '');
      }
    }
  }, [editingCell, displayedKeywords]);

  const handleEditKeydown = (e: React.KeyboardEvent<HTMLInputElement>, id: string, lang: string): void => {
    if (e.key === 'Enter') {
      handleEditSubmit(id, lang, editValue);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // Get sort direction for a column
  const getSortDirection = (key: string): string => {
    if (!sortConfig || sortConfig.key !== key) {
      return '';
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  // If no keywords, show message
  if (displayedKeywords.length === 0) {
    return (
      <div className="keyword-table-container empty">
        <p>No keywords found.</p>
      </div>
    );
  }

  return (
    <div className="keyword-table-container">
      <table className="keyword-table">
        <thead>
          <tr>
            <th 
              className={`sortable ${sortConfig?.key === 'file' ? 'sorted' : ''}`}
              onClick={() => handleSort('file')}
            >
              File {getSortDirection('file')}
            </th>
            <th 
              className={`sortable ${sortConfig?.key === 'id' ? 'sorted' : ''}`}
              onClick={() => handleSort('id')}
            >
              ID {getSortDirection('id')}
            </th>
            <th 
              className={`sortable ${sortConfig?.key === 'cns' ? 'sorted' : ''}`}
              onClick={() => handleSort('cns')}
            >
              Chinese {getSortDirection('cns')}
            </th>
            <th 
              className={`sortable ${sortConfig?.key === 'ko' ? 'sorted' : ''}`}
              onClick={() => handleSort('ko')}
            >
              Korean {getSortDirection('ko')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedKeywords.map(([id, keyword]) => {
            const cnsText = keyword.translations.get('cns') || '';
            const koText = keyword.translations.get('ko') || '';
            const isCustom = keyword.isCustom || false;

            return (
              <tr key={id}>
                <td 
                  className={isCustom ? 'editable-field' : ''}
                  onDoubleClick={() => isCustom && handleCellDoubleClick(id, 'file', cnsText)}
                >
                  {editingCell?.id === id && editingCell?.lang === 'file' ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleEditKeydown(e, id, 'file')}
                      onBlur={() => handleEditSubmit(id, 'file', editValue)}
                    />
                  ) : (
                    keyword.file || (isCustom ? 'custom' : '')
                  )}
                </td>
                <td>{id}</td>
                <td onDoubleClick={() => handleCellDoubleClick(id, 'cns', cnsText)}>
                  {editingCell?.id === id && editingCell?.lang === 'cns' ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleEditKeydown(e, id, 'cns')}
                      onBlur={() => handleEditSubmit(id, 'cns', editValue)}
                    />
                  ) : (
                    cnsText
                  )}
                </td>
                <td onDoubleClick={() => handleCellDoubleClick(id, 'ko', cnsText)}>
                  {editingCell?.id === id && editingCell?.lang === 'ko' ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleEditKeydown(e, id, 'ko')}
                      onBlur={() => handleEditSubmit(id, 'ko', editValue)}
                    />
                  ) : (
                    koText
                  )}
                </td>
                <td>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteKeyword(id)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default KeywordTable; 