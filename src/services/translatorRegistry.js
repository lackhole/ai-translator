import { translateWithOpenAI, translateWithGoogle } from './translationService';

// Registry of available translator types
export const translatorTypes = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-4o-mini', name: 'GPT-4 Opus Mini' },
      { id: 'gpt-4o', name: 'GPT-4 Opus' },
      { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview' }
    ],
    hasModelSelection: true,
    translate: async (text, targetLanguage, keywordMeanings, config, inputLanguage) => {
      return translateWithOpenAI(text, targetLanguage, keywordMeanings, config.model, inputLanguage);
    }
  },
  {
    id: 'google',
    name: 'Google Translate',
    models: [],
    hasModelSelection: false,
    translate: async (text, targetLanguage, keywordMeanings, config, inputLanguage) => {
      return translateWithGoogle(text, targetLanguage, inputLanguage);
    }
  }
];

// Factory function to create a new translator instance
export const createTranslator = (type, instanceId) => {
  const translatorType = translatorTypes.find(t => t.id === type);
  if (!translatorType) {
    throw new Error(`Unknown translator type: ${type}`);
  }

  const defaultModelId = translatorType.models.length > 0 ? translatorType.models[0].id : null;

  return {
    id: instanceId || `${type}_${Date.now()}`,
    type,
    name: translatorType.name,
    config: {
      model: defaultModelId
    },
    models: translatorType.models,
    hasModelSelection: translatorType.hasModelSelection,
    translate: async (text, targetLanguage, keywordMeanings, inputLanguage) => {
      return translatorType.translate(text, targetLanguage, keywordMeanings, { model: defaultModelId }, inputLanguage);
    },
    updateConfig: (config) => {
      return {
        ...translatorType,
        id: instanceId || `${type}_${Date.now()}`,
        config,
        translate: async (text, targetLanguage, keywordMeanings, inputLanguage) => {
          return translatorType.translate(text, targetLanguage, keywordMeanings, config, inputLanguage);
        }
      };
    }
  };
}; 