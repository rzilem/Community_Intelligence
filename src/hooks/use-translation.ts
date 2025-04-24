
import { useState, useEffect, useCallback } from 'react';
import { translationService } from '@/services/translation-service';
import { useAuth } from '@/contexts/auth';

export const useTranslation = () => {
  const { profile } = useAuth();
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferred_language || 'en');
  const [translationCache, setTranslationCache] = useState<Record<string, Record<string, string>>>({});
  const [translateVersion, setTranslateVersion] = useState(0); // Version to trigger re-translation

  useEffect(() => {
    if (profile?.preferred_language) {
      setPreferredLanguage(profile.preferred_language);
    }
  }, [profile?.preferred_language]);

  const getCachedTranslation = useCallback((text: string, language: string): string | null => {
    return translationCache[language]?.[text] || null;
  }, [translationCache]);

  const cacheTranslation = useCallback((text: string, language: string, translation: string) => {
    setTranslationCache(prevCache => ({
      ...prevCache,
      [language]: {
        ...(prevCache[language] || {}),
        [text]: translation
      }
    }));
  }, []);

  const translateText = useCallback(async (text: string, targetLanguage?: string) => {
    if (!text) return '';
    
    const language = targetLanguage || preferredLanguage;
    
    if (language === 'en') return text;
    
    const cachedTranslation = getCachedTranslation(text, language);
    if (cachedTranslation) return cachedTranslation;

    try {
      const translatedText = await translationService.translateText(text, language);
      if (translatedText) {
        cacheTranslation(text, language, translatedText);
        return translatedText;
      }
      return text; // Return original text if translation failed
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  }, [preferredLanguage, getCachedTranslation, cacheTranslation]);

  // Update preferredLanguage and force re-translation
  const changeLanguage = useCallback((language: string) => {
    setPreferredLanguage(language);
    setTranslateVersion(v => v + 1); // Increment version to trigger re-translation
  }, []);

  // Handle generic types in translateTexts with proper type safety
  const translateTexts = useCallback(async <T extends Record<string, any>>(texts: T): Promise<T> => {
    if (!texts || typeof texts !== 'object') return texts;
    if (preferredLanguage === 'en') return texts;
    
    const result = { ...texts } as T;
    
    try {
      const translationPromises = Object.entries(texts).map(async ([key, value]) => {
        if (typeof value === 'string') {
          const translatedText = await translateText(value, preferredLanguage);
          result[key as keyof T] = translatedText as any;
        }
      });
      
      await Promise.all(translationPromises);
      return result;
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts; // Return original texts on error
    }
  }, [preferredLanguage, translateText]);

  return {
    preferredLanguage,
    setPreferredLanguage: changeLanguage, // Use the function that forces re-translation
    translateText,
    translateTexts,
    translateVersion // Expose the version for components to listen to changes
  };
};
