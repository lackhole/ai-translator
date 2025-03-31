import { useState } from 'react';
import { loadTranslationFile } from '../services/keywordService';
import { KeywordTranslation, FileList, UpdateStats } from '../types';

interface FileInfo {
  file: File;
  filename: string;
  path: string;
  selected: boolean;
}

interface DirectoryFiles {
  directory: string;
  files: FileInfo[];
}

interface InternalFileList {
  id: number;
  directoryFiles: DirectoryFiles[];
  selectedFiles: Set<string>;
}

interface UseFileManagementReturn {
  fileLists: FileList[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleFileSelect: (directoryIndex: number, fileIndex: number, selected: boolean) => void;
  handleSaveSelected: () => Promise<void>;
  handleCloseFileList: (directoryIndex: number) => void;
}

export function useFileManagement(
  keywordTranslations: Map<string, KeywordTranslation>,
  setKeywordTranslations: React.Dispatch<React.SetStateAction<Map<string, KeywordTranslation>>>,
  setUseKeywords: React.Dispatch<React.SetStateAction<boolean>>,
  setUpdateStats: React.Dispatch<React.SetStateAction<UpdateStats | null>>,
  setError: React.Dispatch<React.SetStateAction<string>>
): UseFileManagementReturn {
  const [fileLists, setFileLists] = useState<InternalFileList[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      // Group files by directory
      const filesByDir = files.reduce<{[key: string]: {file: File, filename: string, path: string}[]}>((acc, file) => {
        const path = (file as any).webkitRelativePath || file.name;
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
      const newFileList: InternalFileList = {
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

  const handleFileSelect = (directoryIndex: number, fileIndex: number, selected: boolean): void => {
    setFileLists(prev => {
      const newLists = [...prev];
      if (directoryIndex >= 0 && directoryIndex < newLists.length) {
        const list = { ...newLists[directoryIndex] };
        const directoryFiles = [...list.directoryFiles];
        
        if (fileIndex >= 0 && fileIndex < directoryFiles.length) {
          const directory = directoryFiles[fileIndex];
          const fileKey = `${directory.directory}/${directory.files[fileIndex].filename}`;
          
          const newSelectedFiles = new Set(list.selectedFiles);
          if (selected) {
            newSelectedFiles.add(fileKey);
          } else {
            newSelectedFiles.delete(fileKey);
          }
          
          list.selectedFiles = newSelectedFiles;
          newLists[directoryIndex] = list;
        }
      }
      return newLists;
    });
  };

  const handleSaveSelected = async (): Promise<void> => {
    try {
      if (fileLists.length === 0) return;
      
      // Use the first file list (assuming we're working with one at a time)
      const fileList = fileLists[0];

      const newTranslations = new Map<string, KeywordTranslation>();
      const stats: {
        notUpdated: number;
        updated: number;
        newKeys: number;
      } = {
        notUpdated: 0,
        updated: 0,
        newKeys: 0
      };
      
      // First, load all selected files
      const loadedFiles = new Map<string, Map<string, KeywordTranslation>>();
      for (const fileKey of fileList.selectedFiles) {
        const [directory, filename] = fileKey.split('/');
        const dirEntry = fileList.directoryFiles.find(dir => dir.directory === directory);
        if (!dirEntry) continue;
        
        const fileEntry = dirEntry.files.find(f => f.filename === filename);
        if (!fileEntry) continue;
        
        const file = fileEntry.file;
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
      for (const [fileKey, translations] of loadedFiles.entries()) {
        // Count statistics for this file
        translations.forEach((value: KeywordTranslation, key: string) => {
          if (keywordTranslations.has(key)) {
            stats.updated++;
          } else {
            stats.newKeys++;
          }
        });
        
        // Merge translations
        translations.forEach((value: KeywordTranslation, key: string) => {
          if (newTranslations.has(key)) {
            const existing = newTranslations.get(key);
            if (existing) {
              value.translations.forEach((translation: string, lang: string) => {
                existing.translations.set(lang, translation);
              });
            }
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
      newTranslations.forEach((value: KeywordTranslation, key: string) => {
        if (mergedTranslations.has(key)) {
          const existing = mergedTranslations.get(key);
          if (existing) {
            value.translations.forEach((translation: string, lang: string) => {
              existing.translations.set(lang, translation);
            });
          }
        } else {
          mergedTranslations.set(key, {
            ...value,
            translations: new Map(value.translations)
          });
        }
      });

      setKeywordTranslations(mergedTranslations);
      setUseKeywords(true);
      setUpdateStats({
        added: stats.newKeys,
        updated: stats.updated,
        unchanged: stats.notUpdated,
        total: stats.newKeys + stats.updated + stats.notUpdated
      });
      setError('');
    } catch (err) {
      setError('Failed to save selected files. Please try again.');
    }
  };

  const handleCloseFileList = (directoryIndex: number): void => {
    setFileLists(prev => {
      const newLists = [...prev];
      if (directoryIndex >= 0 && directoryIndex < newLists.length) {
        newLists.splice(directoryIndex, 1);
      }
      return newLists;
    });
  };

  // Convert internal file lists to the format expected by the components
  const convertedFileLists: FileList[] = fileLists.map(list => ({
    directory: list.directoryFiles.length > 0 ? list.directoryFiles[0].directory : 'Unknown',
    files: list.directoryFiles.flatMap(dir => 
      dir.files.map(file => ({
        path: file.path,
        selected: list.selectedFiles.has(`${dir.directory}/${file.filename}`)
      }))
    )
  }));

  return {
    fileLists: convertedFileLists,
    handleFileUpload,
    handleFileSelect,
    handleSaveSelected,
    handleCloseFileList
  };
} 