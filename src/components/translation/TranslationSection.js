import React from 'react';
import TranslationInput from './TranslationInput';
import TranslationOutput from './TranslationOutput';

function TranslationSection({
  sourceText,
  setSourceText,
  translations,
  translators,
  setTranslators,
  targetLanguage,
  setTargetLanguage,
  inputLanguage,
  setInputLanguage,
  handleTranslate,
  findMatchingKeywords,
  autoTranslateOnPaste,
  setAutoTranslateOnPaste
}) {
  return (
    <div className="translation-container">
      <div className="translation-columns">
        <div className="left-column">
          <TranslationInput
            sourceText={sourceText}
            setSourceText={setSourceText}
            findMatchingKeywords={findMatchingKeywords}
            handleTranslate={handleTranslate}
            autoTranslateOnPaste={autoTranslateOnPaste}
            setAutoTranslateOnPaste={setAutoTranslateOnPaste}
            inputLanguage={inputLanguage}
            setInputLanguage={setInputLanguage}
          />
        </div>
        <div className="right-column">
          <TranslationOutput 
            translations={translations} 
            translators={translators}
            onUpdateTranslators={setTranslators}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
            handleTranslate={handleTranslate}
            sourceText={sourceText}
          />
        </div>
      </div>
    </div>
  );
}

export default TranslationSection; 