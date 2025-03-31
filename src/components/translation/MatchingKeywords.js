import React from 'react';

function MatchingKeywords({ sourceText, findMatchingKeywords }) {
  return (
    <div className="matching-keywords">
      <div className="matching-table">
        <div className="matching-table-header">
          <div className="matching-cell">File</div>
          <div className="matching-cell">ID</div>
          <div className="matching-cell">CNS</div>
          <div className="matching-cell">KO</div>
        </div>
        <div className="matching-table-body">
          {findMatchingKeywords(sourceText).map(([key, value]) => (
            <div key={key} className="matching-row">
              <div className="matching-cell file">{value.sourceFile}</div>
              <div className="matching-cell id">{key}</div>
              <div className="matching-cell cns">{value.translations.get('cns')}</div>
              <div className="matching-cell ko">{value.translations.get('ko') || ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MatchingKeywords; 