import { useState, useEffect } from 'react';

const STORAGE_KEY = 'openai_api_key';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(STORAGE_KEY, apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [apiKey]);

  return [apiKey, setApiKey];
}; 