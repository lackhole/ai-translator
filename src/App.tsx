import React, { useState } from 'react';
import './App.css';
import { useKeywords } from './hooks/useKeywords';
import { useTranslation } from './hooks/useTranslation';
import { useFileManagement } from './hooks/useFileManagement';
import TranslationSection from './components/translation/TranslationSection';
import KeywordSection from './components/keyword/KeywordSection';
import FileSection from './components/file/FileSection';
import Navbar from './components/Navbar';
import { EditingCell } from './types';

function App(): React.ReactElement {
  // Get state and functions from custom hooks
  const {
    keywordTranslations,
    setKeywordTranslations,
    useKeywords: useKeywordBank,
    setUseKeywords,
    keywordSearch,
    setKeywordSearch,
    selectedCategory,
    setSelectedCategory,
    updateStats,
    setUpdateStats,
    sortConfig,
    handleSort,
    editingCell,
    setEditingCell,
    displayedKeywords,
    handleTranslationUpdate,
    handleDeleteKeyword,
    handleEditCancel,
    handleEditSubmit,
    handleClearTranslations,
    handleExportTranslations,
    findMatchingKeywords,
    categories,
    handleAddCustomKeyword
  } = useKeywords();

  const { 
    sourceText,
    setSourceText,
    targetLanguage,
    setTargetLanguage,
    translations,
    error,
    setError,
    handleTranslate,
    handleCellDoubleClick: translateCellText,
    inputLanguage,
    setInputLanguage,
    translators,
    setTranslators
  } = useTranslation(keywordTranslations, useKeywordBank);

  const {
    fileLists,
    handleFileUpload,
    handleFileSelect,
    handleSaveSelected,
    handleCloseFileList
  } = useFileManagement(keywordTranslations, setKeywordTranslations, setUseKeywords, setUpdateStats, setError);

  const [autoTranslateOnPaste, setAutoTranslateOnPaste] = useState<boolean>(false);

  // Combine cell double click handlers
  const handleCellDoubleClick = (key: string, lang: string, cnsText: string): void => {
    const editInfo = translateCellText(key, lang, cnsText);
    setEditingCell(editInfo as EditingCell);
  };

  const handleTranslateAll = (): void => {
    handleTranslate(sourceText, 'all');
  };

  return (
    <div className="App">
      <Navbar />
      <header className="App-header">
        <h1>Mount and Blade Translator</h1>
      </header>
      <main className="App-main">
        <TranslationSection
          sourceText={sourceText}
          setSourceText={setSourceText}
          translations={translations}
          translators={translators}
          setTranslators={setTranslators}
          useKeywords={useKeywordBank}
          setUseKeywords={setUseKeywords}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          inputLanguage={inputLanguage}
          setInputLanguage={setInputLanguage}
          handleTranslate={handleTranslate}
          findMatchingKeywords={findMatchingKeywords}
          autoTranslateOnPaste={autoTranslateOnPaste}
          setAutoTranslateOnPaste={setAutoTranslateOnPaste}
        />
        
        <KeywordSection
          keywordTranslations={keywordTranslations}
          displayedKeywords={displayedKeywords}
          sortConfig={sortConfig}
          isSorting={false}
          editingCell={editingCell}
          handleSort={handleSort}
          handleCellDoubleClick={handleCellDoubleClick}
          handleEditSubmit={handleEditSubmit}
          handleEditCancel={handleEditCancel}
          handleDeleteKeyword={handleDeleteKeyword}
          handleExportTranslations={handleExportTranslations}
          handleClearTranslations={handleClearTranslations}
          handleAddCustomKeyword={handleAddCustomKeyword}
        />
        
        <FileSection
          fileLists={fileLists}
          handleFileUpload={handleFileUpload}
          handleFileSelect={handleFileSelect}
          handleSaveSelected={handleSaveSelected}
          handleCloseFileList={handleCloseFileList}
          updateStats={updateStats}
        />

        {error && <div className="error-message">{error}</div>}
      </main>
    </div>
  );
}

export default App; 