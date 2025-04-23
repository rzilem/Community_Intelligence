
import { useState, useEffect, useCallback } from 'react';
import { translationService } from '@/services/translation-service';
import { useAuth } from '@/contexts/auth';

export const useTranslation = () => {
  const { profile } = useAuth();
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferred_language || 'en');
  const [translationCache, setTranslationCache] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (profile?.preferred_language) {
      setPreferredLanguage(profile.preferred_language);
    }
  }, [profile?.preferred_language]);

  const getCachedTranslation = (text: string, language: string): string | null => {
    return translationCache[language]?.[text] || null;
  };

  const cacheTranslation = (text: string, language: string, translation: string) => {
    setTranslationCache(prevCache => ({
      ...prevCache,
      [language]: {
        ...(prevCache[language] || {}),
        [text]: translation
      }
    }));
  };

  const translateText = useCallback(async (text: string, targetLanguage?: string) => {
    const language = targetLanguage || preferredLanguage;
    
    if (language === 'en') return text;
    
    const cachedTranslation = getCachedTranslation(text, language);
    if (cachedTranslation) return cachedTranslation;

    try {
      const translatedText = await translationService.translateText(text, language);
      cacheTranslation(text, language, translatedText);
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, [preferredLanguage]);

  const translateTexts = useCallback(async <T extends Record<string, string>>(texts: T): Promise<T> => {
    if (preferredLanguage === 'en') return texts;
    
    const translations = { ...texts };
    
    try {
      const translationPromises = Object.entries(texts).map(async ([key, text]) => {
        const translatedText = await translateText(text, preferredLanguage);
        translations[key] = translatedText;
      });
      
      await Promise.all(translationPromises);
      return translations as T;
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    }
  }, [preferredLanguage, translateText]);

  return {
    preferredLanguage,
    setPreferredLanguage,
    translateText,
    translateTexts
  };
};
