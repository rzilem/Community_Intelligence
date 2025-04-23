
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';

export const useTranslation = () => {
  const { profile } = useAuth();
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferred_language || 'en');
  const [translateVersion, setTranslateVersion] = useState(0);

  // This is a simplified version that doesn't actually translate
  // Just returns the original text to prevent crashes
  const translateText = useCallback(async (text: string) => {
    return text; // Simply return the original text without translation
  }, []);

  // Update preferredLanguage and force re-translation
  const changeLanguage = useCallback((language: string) => {
    setPreferredLanguage(language);
    setTranslateVersion(v => v + 1); // Increment version to trigger re-translation
  }, []);

  // Simplified version that doesn't translate
  const translateTexts = useCallback(async <T extends Record<string, any>>(texts: T): Promise<T> => {
    return texts; // Return original texts without translation
  }, []);

  return {
    preferredLanguage,
    setPreferredLanguage: changeLanguage,
    translateText,
    translateTexts,
    translateVersion
  };
};
