import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { 
  loadTranslationsFromStorage, 
  saveTranslationsToStorage,
  getCategories
} from '../services/keywordService';

export function useKeywords() {
  const [keywordTranslations, setKeywordTranslations] = useState(new Map());
  const [useKeywords, setUseKeywords] = useState(false);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [updateStats, setUpdateStats] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [isSorting, setIsSorting] = useState(false);
  const [editingCell, setEditingCell] = useState(null);

  // Load translations from storage when the app starts
  useEffect(() => {
    const storedTranslations = loadTranslationsFromStorage();
    if (storedTranslations.size > 0) {
      setKeywordTranslations(storedTranslations);
      setUseKeywords(true);
    }
  }, []);

  // Memoize filtered keywords to prevent recalculation on every render
  const filteredKeywords = useMemo(() => {
    let filtered = Array.from(keywordTranslations);
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(([_, value]) => value.sourceFile === selectedCategory);
    }
    
    if (keywordSearch) {
      const searchLower = keywordSearch.toLowerCase();
      filtered = filtered.filter(([key, value]) => 
        key.toLowerCase().includes(searchLower) ||
        Array.from(value.translations.values())
          .some(translation => translation.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [keywordTranslations, selectedCategory, keywordSearch]);

  // Memoize sorted keywords to prevent unnecessary sorting
  const displayedKeywords = useMemo(() => {
    if (!sortConfig.key) return filteredKeywords;
    
    return [...filteredKeywords].sort(([keyA, valueA], [keyB, valueB]) => {
      let a, b;
      
      switch (sortConfig.key) {
        case 'file':
          a = valueA.sourceFile;
          b = valueB.sourceFile;
          break;
        case 'id':
          a = keyA;
          b = keyB;
          break;
        case 'cns':
          a = valueA.translations.get('cns') || '';
          b = valueB.translations.get('cns') || '';
          break;
        case 'ko':
          a = valueA.translations.get('ko') || '';
          b = valueB.translations.get('ko') || '';
          break;
        default:
          return 0;
      }

      return sortConfig.direction === 'asc' 
        ? a.localeCompare(b)
        : b.localeCompare(a);
    });
  }, [filteredKeywords, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Optimized translation update function
  const handleTranslationUpdate = (keywordId, language, newValue) => {
    setKeywordTranslations(prev => {
      const updated = new Map(prev);
      const keyword = updated.get(keywordId);
      if (keyword) {
        keyword.translations.set(language, newValue);
      }
      return updated;
    });
    
    // Debounce storage updates
    debouncedSaveTranslations(keywordTranslations);
    setEditingCell(null);
  };

  // Debounced save function
  const debouncedSaveTranslations = useCallback(
    debounce((translations) => {
      saveTranslationsToStorage(translations);
    }, 1000),
    []
  );

  // Optimized delete function with immediate UI update
  const handleDeleteKeyword = (keywordId) => {
    setKeywordTranslations(prev => {
      const updated = new Map(prev);
      updated.delete(keywordId);
      // Debounce storage update
      debouncedSaveTranslations(updated);
      return updated;
    });
  };

  // Function to handle edit cancellation
  const handleEditCancel = (e) => {
    if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Function to handle edit submission
  const handleEditSubmit = (keywordId, language, value) => {
    if (language === 'file') {
      setKeywordTranslations(prev => {
        const updated = new Map(prev);
        const keyword = updated.get(keywordId);
        if (keyword) {
          keyword.sourceFile = value;
        }
        return updated;
      });
      // Debounce storage updates
      debouncedSaveTranslations(keywordTranslations);
      setEditingCell(null);
    } else {
      handleTranslationUpdate(keywordId, language, value);
    }
  };

  const handleClearTranslations = () => {
    localStorage.removeItem('mb_translator_keywords');
    setKeywordTranslations(new Map());
    setUseKeywords(false);
    setUpdateStats(null);
  };

  // Function to add a custom keyword
  const handleAddCustomKeyword = () => {
    const customId = `custom_${Date.now()}`;
    
    setKeywordTranslations(prev => {
      const updated = new Map(prev);
      updated.set(customId, {
        sourceFile: '',  // Empty file name
        translations: new Map(),
        isCustom: true,  // Mark as custom keyword
        category: 'custom'
      });
      return updated;
    });
    
    // Set editing to the CNS field of the new keyword
    setEditingCell({ id: customId, lang: 'cns' });
    
    // Save to storage
    debouncedSaveTranslations(keywordTranslations);
  };

  // Function to handle export of Korean translations
  const handleExportTranslations = () => {
    // Group translations by source file
    const translationsByFile = new Map();
    
    displayedKeywords.forEach(([key, value]) => {
      const sourceFile = value.sourceFile;
      const koTranslation = value.translations.get('ko') || '';
      
      // Skip if file is empty (custom keywords without file name)
      if (!sourceFile || sourceFile === '') return;
      
      if (!translationsByFile.has(sourceFile)) {
        translationsByFile.set(sourceFile, []);
      }
      
      translationsByFile.get(sourceFile).push(`${key}|${koTranslation}`);
    });
    
    // Create and download files for each source
    translationsByFile.forEach((translations, sourceFile) => {
      const content = translations.join('\n');
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Use the exact same filename as the source
      a.download = sourceFile;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  // Function to find exact substring matches in the source text
  const findMatchingKeywords = (text) => {
    if (!text) return [];
    
    return Array.from(keywordTranslations)
      .filter(([key, value]) => {
        const cnsText = value.translations.get('cns') || '';
        return cnsText && text.includes(cnsText);
      })
      .sort((a, b) => {
        // Sort by length of CNS text (longer matches first)
        const aLength = (a[1].translations.get('cns') || '').length;
        const bLength = (b[1].translations.get('cns') || '').length;
        return bLength - aLength;
      });
  };

  const categories = getCategories(keywordTranslations);

  return {
    keywordTranslations,
    setKeywordTranslations,
    useKeywords,
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
    filteredKeywords,
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
  };
} 