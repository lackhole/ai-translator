import React from 'react';
import { MatchingKeywordsProps, KeywordTranslation } from '../../types';

const MatchingKeywords: React.FC<MatchingKeywordsProps> = ({ sourceText, findMatchingKeywords }) => {
  // Only find matching keywords if source text exists
  if (!sourceText.trim()) {
    return null;
  }

  const matchingKeywords = findMatchingKeywords(sourceText);

  // If no matches, don't render anything
  if (!matchingKeywords.length) {
    return null;
  }

  return (
    <div className="matching-keywords">
      <div className="matching-keywords-label">Matching Keywords</div>
      <div className="keyword-matches">
        {matchingKeywords.map(([id, keyword]) => {
          const cnsText = keyword.translations.get('cns') || '';
          const koText = keyword.translations.get('ko') || '';
          
          return (
            <div key={id} className="keyword-match">
              <div className="keyword-original">{cnsText}</div>
              <div className="keyword-translations">
                {koText && <div className="translation-text">{koText}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchingKeywords; 