// Keyword related types
export interface KeywordTranslation {
  file: string;
  translations: Map<string, string>;
  isCustom?: boolean;
}

export interface SortConfig {
  key: string | null;
  direction: 'ascending' | 'descending';
}

export interface EditingCell {
  id: string;
  lang: string;
}

export interface FileItem {
  path: string;
  selected: boolean;
}

export interface FileList {
  directory: string;
  files: FileItem[];
}

export interface UpdateStats {
  added: number;
  updated: number;
  unchanged: number;
  total: number;
}

export interface Translator {
  id: string;
  name: string;
  type: string;
  config: {
    model: string | null;
    [key: string]: any;
  };
  models: Array<{ id: string; name: string; }>;
  hasModelSelection: boolean;
  translate: (text: string, targetLanguage: string, keywordMeanings: [string, string][], inputLanguage?: string) => Promise<string | { text: string, keywordMeanings?: [string, string][] }>;
  updateConfig: (config: any) => any;
}

export interface Translation {
  text: string;
  isLoading?: boolean;
  keywordMeanings?: [string, string][];
}

// Component props
export interface TranslationSectionProps {
  sourceText: string;
  setSourceText: React.Dispatch<React.SetStateAction<string>>;
  translations: Record<string, Translation>;
  translators: Translator[];
  setTranslators: React.Dispatch<React.SetStateAction<Translator[]>>;
  useKeywords: boolean;
  setUseKeywords: React.Dispatch<React.SetStateAction<boolean>>;
  targetLanguage: string;
  setTargetLanguage: React.Dispatch<React.SetStateAction<string>>;
  inputLanguage: string;
  setInputLanguage: React.Dispatch<React.SetStateAction<string>>;
  handleTranslate: (text: string, translatorId: string, targetLanguage?: string) => void;
  findMatchingKeywords: (text: string) => [string, KeywordTranslation][];
  autoTranslateOnPaste: boolean;
  setAutoTranslateOnPaste: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface KeywordSectionProps {
  keywordTranslations: Map<string, KeywordTranslation>;
  displayedKeywords: [string, KeywordTranslation][];
  sortConfig: SortConfig | null;
  isSorting: boolean;
  editingCell: EditingCell | null;
  handleSort: (key: string) => void;
  handleCellDoubleClick: (key: string, lang: string, cnsText: string) => void;
  handleEditSubmit: (key: string, lang: string, value: string) => void;
  handleEditCancel: (e?: React.KeyboardEvent<Element>) => void;
  handleDeleteKeyword: (key: string) => void;
  handleExportTranslations: () => void;
  handleClearTranslations: () => void;
  handleAddCustomKeyword: () => void;
}

export interface FileSectionProps {
  fileLists: FileList[];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileSelect: (directoryIndex: number, fileIndex: number, selected: boolean) => void;
  handleSaveSelected: () => void;
  handleCloseFileList: (directoryIndex: number) => void;
  updateStats: UpdateStats | null;
}

export interface TranslationInputProps {
  sourceText: string;
  setSourceText: React.Dispatch<React.SetStateAction<string>>;
  handleTranslate: (text: string, translatorId: string, targetLanguage?: string) => void;
  findMatchingKeywords: (text: string) => [string, KeywordTranslation][];
  autoTranslateOnPaste: boolean;
  setAutoTranslateOnPaste: React.Dispatch<React.SetStateAction<boolean>>;
  inputLanguage: string;
  setInputLanguage: React.Dispatch<React.SetStateAction<string>>;
}

export interface MatchingKeywordsProps {
  sourceText: string;
  findMatchingKeywords: (text: string) => [string, KeywordTranslation][];
}

export interface TranslatorOutputProps {
  translator: Translator;
  translation: Translation;
  onDelete: (id: string) => void;
  onModelChange?: (id: string, config: {model: string | null}) => void;
}

export interface NavbarProps {
  apiKey?: string;
  setApiKey?: React.Dispatch<React.SetStateAction<string>>;
}

export interface TranslatorType {
  id: string;
  name: string;
}

export interface CreateTranslatorFunction {
  (translatorType: string): any;
} 