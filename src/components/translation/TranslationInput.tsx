import React, { useRef, useState, useEffect } from 'react';
import MatchingKeywords from './MatchingKeywords';
import { TranslationInputProps, KeywordTranslation } from '../../types';

const TranslationInput: React.FC<TranslationInputProps> = ({
  sourceText,
  setSourceText,
  handleTranslate,
  findMatchingKeywords,
  autoTranslateOnPaste,
  setAutoTranslateOnPaste,
  inputLanguage,
  setInputLanguage
}) => {
  const [localText, setLocalText] = useState<string>(sourceText);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [showHighlights, setShowHighlights] = useState<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightedDivRef = useRef<HTMLDivElement>(null);

  // Update local state when props change (from external)
  useEffect(() => {
    setLocalText(sourceText);
  }, [sourceText]);

  // Apply highlighting immediately
  useEffect(() => {
    if (showHighlights) {
      let html = localText;
      
      // Only proceed with highlighting if there's text to process
      if (localText.trim()) {
        const matches = findMatchingKeywords(localText);
        
        // Sort matches by length (longest first) to prevent nested highlights
        const sortedMatches = [...matches].sort((a, b) => {
          const aText = a[1].translations.get('cns') || '';
          const bText = b[1].translations.get('cns') || '';
          return bText.length - aText.length;
        });

        // Highlight each match
        sortedMatches.forEach(([_, value]) => {
          const cnsText = value.translations.get('cns');
          if (cnsText) {
            const regex = new RegExp(cnsText, 'g');
            html = html.replace(regex, `<span class="highlight">${cnsText}</span>`);
          }
        });
      }

      setHighlightedText(html);
    }
  }, [localText, findMatchingKeywords, showHighlights]);

  // Sync highlight div scrolling with textarea
  useEffect(() => {
    if (textareaRef.current && highlightedDivRef.current) {
      highlightedDivRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  });

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const text = e.target.value;
    setLocalText(text); // Update local state immediately for highlighting
    setSourceText(text); // Update parent state
  };

  const handleScroll = (): void => {
    if (textareaRef.current && highlightedDivRef.current) {
      highlightedDivRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>): void => {
    if (autoTranslateOnPaste) {
      const text = e.clipboardData.getData('text/plain');
      setLocalText(text);
      setSourceText(text); // Update parent state immediately on paste
      setTimeout(() => handleTranslate(text, 'all'), 50);
    }
  };

  return (
    <div className="translation-input">
      <div className="translation-input-box">
        <div className="translation-header">
          <h3>Source Text</h3>
          <div className="translation-controls">
            <select
              value={inputLanguage}
              onChange={(e) => setInputLanguage(e.target.value)}
              className="language-select"
            >
              <option value="auto">Auto-detect</option>
              <option value="cns">Chinese (Simplified)</option>
              <option value="ko">Korean</option>
            </select>
            <label className="highlight-toggle">
              <input
                type="checkbox"
                checked={showHighlights}
                onChange={() => setShowHighlights(!showHighlights)}
                title="Show/hide keyword highlighting"
              />
              <span title="Show/hide keyword highlighting">Highlight</span>
            </label>
            <label className="auto-translate-toggle">
              <input
                type="checkbox"
                checked={autoTranslateOnPaste}
                onChange={() => setAutoTranslateOnPaste(!autoTranslateOnPaste)}
                title="Automatically translate text when pasted"
              />
              <span title="Automatically translate text when pasted">Paste-N-Run</span>
            </label>
            <button 
              className="translate-button"
              onClick={() => handleTranslate(localText, 'all')}
            >
              Translate All
            </button>
          </div>
        </div>
        <div className="input-container">
          {showHighlights ? (
            <div 
              ref={highlightedDivRef}
              className="highlighted-text"
              dangerouslySetInnerHTML={{ __html: highlightedText }}
            />
          ) : null}
          <textarea
            ref={textareaRef}
            className="input-text"
            value={localText}
            onChange={handleInput}
            onScroll={handleScroll}
            onPaste={handlePaste}
            placeholder="Enter text to translate..."
            style={{
              backgroundColor: showHighlights ? 'transparent' : '#1e1e1e'
            }}
          />
        </div>
      </div>
      <MatchingKeywords 
        sourceText={sourceText} 
        findMatchingKeywords={findMatchingKeywords} 
      />
    </div>
  );
};

export default TranslationInput; 