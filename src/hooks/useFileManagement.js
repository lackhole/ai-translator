import { useState } from 'react';
import { loadTranslationFile } from '../services/keywordService';

export function useFileManagement(keywordTranslations, setKeywordTranslations, setUseKeywords, setUpdateStats, setError) {
  const [fileLists, setFileLists] = useState([]);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    try {
      // Group files by directory
      const filesByDir = files.reduce((acc, file) => {
        const path = file.webkitRelativePath || file.name;
        const parts = path.split('/');
        const dir = parts[0];
        const filename = parts[parts.length - 1];
        if (!acc[dir]) {
          acc[dir] = [];
        }
        acc[dir].push({ file, filename, path });
        return acc;
      }, {});

      // Create new file list
      const newFileList = {
        id: Date.now(),
        directoryFiles: Object.entries(filesByDir).map(([dir, files]) => ({
          directory: dir,
          files: files.map(({ file, filename, path }) => ({
            file,
            filename,
            path,
            selected: false
          }))
        })),
        selectedFiles: new Set()
      };

      // Add new file list to the state
      setFileLists(prev => [...prev, newFileList]);
      setError('');
    } catch (err) {
      setError('Failed to load directory. Please check the directory structure.');
    }
  };

  const handleFileSelect = (listId, directory, filename) => {
    setFileLists(prev => prev.map(list => {
      if (list.id === listId) {
        const fileKey = `${directory}/${filename}`;
        const newSelectedFiles = new Set(list.selectedFiles);
        if (newSelectedFiles.has(fileKey)) {
          newSelectedFiles.delete(fileKey);
        } else {
          newSelectedFiles.add(fileKey);
        }
        return { ...list, selectedFiles: newSelectedFiles };
      }
      return list;
    }));
  };

  const handleSaveSelected = async (listId) => {
    try {
      const fileList = fileLists.find(list => list.id === listId);
      if (!fileList) return;

      const newTranslations = new Map();
      const stats = {
        notUpdated: 0,
        updated: 0,
        newKeys: 0
      };
      
      // First, load all selected files
      const loadedFiles = new Map();
      for (const fileKey of fileList.selectedFiles) {
        const [directory, filename] = fileKey.split('/');
        const file = fileList.directoryFiles
          .find(dir => dir.directory === directory)
          ?.files.find(f => f.filename === filename)?.file;

        if (file) {
          const fileWithPath = new File([file], fileKey, {
            type: file.type,
            lastModified: file.lastModified
          });

          const translations = await loadTranslationFile(fileWithPath);
          loadedFiles.set(fileKey, translations);
        }
      }
      
      // Count existing keys that are not in new files
      keywordTranslations.forEach((value, key) => {
        let keyExistsInNewFiles = false;
        for (const translations of loadedFiles.values()) {
          if (translations.has(key)) {
            keyExistsInNewFiles = true;
            break;
          }
        }
        if (!keyExistsInNewFiles) {
          stats.notUpdated++;
        }
      });
      
      // Process each loaded file
      for (const [fileKey, translations] of loadedFiles) {
        // Count statistics for this file
        translations.forEach((value, key) => {
          if (keywordTranslations.has(key)) {
            stats.updated++;
          } else {
            stats.newKeys++;
          }
        });
        
        // Merge translations
        translations.forEach((value, key) => {
          if (newTranslations.has(key)) {
            const existing = newTranslations.get(key);
            value.translations.forEach((translation, lang) => {
              existing.translations.set(lang, translation);
            });
          } else {
            newTranslations.set(key, {
              ...value,
              translations: new Map(value.translations)
            });
          }
        });
      }

      // Merge with existing translations
      const mergedTranslations = new Map(keywordTranslations);
      newTranslations.forEach((value, key) => {
        if (mergedTranslations.has(key)) {
          const existing = mergedTranslations.get(key);
          value.translations.forEach((translation, lang) => {
            existing.translations.set(lang, translation);
          });
        } else {
          mergedTranslations.set(key, {
            ...value,
            translations: new Map(value.translations)
          });
        }
      });

      setKeywordTranslations(mergedTranslations);
      setUseKeywords(true);
      setUpdateStats(stats);
      setError('');
    } catch (err) {
      setError('Failed to save selected files. Please try again.');
    }
  };

  const handleCloseFileList = (listId) => {
    setFileLists(prev => prev.filter(list => list.id !== listId));
  };

  return {
    fileLists,
    handleFileUpload,
    handleFileSelect,
    handleSaveSelected,
    handleCloseFileList
  };
} 