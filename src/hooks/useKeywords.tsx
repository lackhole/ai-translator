import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { 
  loadTranslationsFromStorage, 
  saveTranslationsToStorage,
  getCategories
} from '../services/keywordService';
import { KeywordTranslation, SortConfig, EditingCell, UpdateStats } from '../types';

interface UseKeywordsReturn {
  keywordTranslations: Map<string, KeywordTranslation>;
  setKeywordTranslations: React.Dispatch<React.SetStateAction<Map<string, KeywordTranslation>>>;
  useKeywords: boolean;
  setUseKeywords: React.Dispatch<React.SetStateAction<boolean>>;
  keywordSearch: string;
  setKeywordSearch: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  updateStats: UpdateStats | null;
  setUpdateStats: React.Dispatch<React.SetStateAction<UpdateStats | null>>;
  sortConfig: SortConfig | null;
  handleSort: (key: string) => void;
  editingCell: EditingCell | null;
  setEditingCell: React.Dispatch<React.SetStateAction<EditingCell | null>>;
  displayedKeywords: [string, KeywordTranslation][];
  handleTranslationUpdate: (keywordId: string, language: string, newValue: string) => void;
  handleDeleteKeyword: (keywordId: string) => void;
  handleEditCancel: (e?: React.KeyboardEvent) => void;
  handleEditSubmit: (keywordId: string, language: string, value: string) => void;
  handleClearTranslations: () => void;
  handleExportTranslations: () => void;
  findMatchingKeywords: (text: string) => [string, KeywordTranslation][];
  categories: string[];
  handleAddCustomKeyword: () => void;
}

export function useKeywords(): UseKeywordsReturn {
  const [keywordTranslations, setKeywordTranslations] = useState<Map<string, KeywordTranslation>>(new Map());
  const [useKeywords, setUseKeywords] = useState<boolean>(false);
  const [keywordSearch, setKeywordSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [updateStats, setUpdateStats] = useState<UpdateStats | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: null,
    direction: 'ascending'
  });
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

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
      filtered = filtered.filter(([_, value]) => value.file === selectedCategory);
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
    if (!sortConfig?.key) return filteredKeywords;
    
    return [...filteredKeywords].sort(([keyA, valueA], [keyB, valueB]) => {
      let a: string, b: string;
      
      switch (sortConfig.key) {
        case 'file':
          a = valueA.file || '';
          b = valueB.file || '';
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

      return sortConfig.direction === 'ascending' 
        ? a.localeCompare(b)
        : b.localeCompare(a);
    });
  }, [filteredKeywords, sortConfig]);

  const handleSort = (key: string): void => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig?.key === key && prevConfig?.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Debounced save function
  const debouncedSaveTranslations = useCallback(
    debounce((translations: Map<string, KeywordTranslation>) => {
      saveTranslationsToStorage(translations);
    }, 1000),
    []
  );

  // Optimized translation update function
  const handleTranslationUpdate = (keywordId: string, language: string, newValue: string): void => {
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

  // Optimized delete function with immediate UI update
  const handleDeleteKeyword = (keywordId: string): void => {
    setKeywordTranslations(prev => {
      const updated = new Map(prev);
      updated.delete(keywordId);
      // Debounce storage update
      debouncedSaveTranslations(updated);
      return updated;
    });
  };

  // Function to handle edit cancellation
  const handleEditCancel = (e?: React.KeyboardEvent): void => {
    if (!e || e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Function to handle edit submission
  const handleEditSubmit = (keywordId: string, language: string, value: string): void => {
    if (language === 'file') {
      setKeywordTranslations(prev => {
        const updated = new Map(prev);
        const keyword = updated.get(keywordId);
        if (keyword) {
          keyword.file = value;
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

  const handleClearTranslations = (): void => {
    localStorage.removeItem('mb_translator_keywords');
    setKeywordTranslations(new Map());
    setUseKeywords(false);
    setUpdateStats(null);
  };

  // Function to add a custom keyword
  const handleAddCustomKeyword = (): void => {
    const customId = `custom_${Date.now()}`;
    
    setKeywordTranslations(prev => {
      const updated = new Map(prev);
      updated.set(customId, {
        file: '',  // Empty file name
        translations: new Map(),
        isCustom: true  // Mark as custom keyword
      });
      return updated;
    });
    
    // Set editing to the CNS field of the new keyword
    setEditingCell({ id: customId, lang: 'cns' });
    
    // Save to storage
    debouncedSaveTranslations(keywordTranslations);
  };

  // Function to handle export of Korean translations
  const handleExportTranslations = (): void => {
    // Group translations by source file
    const translationsByFile = new Map<string, string[]>();
    
    displayedKeywords.forEach(([key, value]) => {
      const sourceFile = value.file;
      const koTranslation = value.translations.get('ko') || '';
      
      // Skip if file is empty (custom keywords without file name)
      if (!sourceFile || sourceFile === '') return;
      
      if (!translationsByFile.has(sourceFile)) {
        translationsByFile.set(sourceFile, []);
      }
      
      translationsByFile.get(sourceFile)?.push(`${key}|${koTranslation}`);
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
  const findMatchingKeywords = (text: string): [string, KeywordTranslation][] => {
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