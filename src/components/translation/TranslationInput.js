import React, { useEffect, useRef } from 'react';
import MatchingKeywords from './MatchingKeywords';

function TranslationInput({
  sourceText,
  setSourceText,
  handleTranslate,
  findMatchingKeywords,
  autoTranslateOnPaste,
  setAutoTranslateOnPaste,
  inputLanguage,
  setInputLanguage
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    
    const matches = findMatchingKeywords(sourceText);
    const text = editorRef.current.innerText;
    let html = text;

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

    // Only update if content has changed
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [sourceText, findMatchingKeywords]);

  const handleInput = (e) => {
    setSourceText(e.target.innerText);
  };

  const handlePaste = async (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    // First update the text content
    document.execCommand('insertText', false, text);
    
    // Then update the source text state
    const newText = editorRef.current.innerText;
    setSourceText(newText);
    
    // If auto-translate is enabled, wait for state updates and then translate
    if (autoTranslateOnPaste) {
      // Use a small delay to ensure state updates are complete
      await new Promise(resolve => setTimeout(resolve, 50));
      handleTranslate(newText, 'all');
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
              onClick={() => handleTranslate(sourceText, 'all')}
            >
              Translate All
            </button>
          </div>
        </div>
        <div
          ref={editorRef}
          className="input-text"
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          suppressContentEditableWarning={true}
        >
          {sourceText}
        </div>
      </div>
      <MatchingKeywords 
        sourceText={sourceText} 
        findMatchingKeywords={findMatchingKeywords} 
      />
    </div>
  );
}

export default TranslationInput; 