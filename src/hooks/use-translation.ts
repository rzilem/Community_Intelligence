
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

  // Caching mechanism to improve performance and reduce API calls
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
    
    // Check cache first
    const cachedTranslation = getCachedTranslation(text, language);
    if (cachedTranslation) return cachedTranslation;

    try {
      const translatedText = await translationService.translateText(text, language);
      // Cache the result for future use
      cacheTranslation(text, language, translatedText);
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  }, [preferredLanguage, translationCache]);

  // Force immediate translation of multiple text items
  const translateTexts = useCallback(async (texts: Record<string, string>): Promise<Record<string, string>> => {
    const language = preferredLanguage;
    if (language === 'en') return texts;
    
    const translations: Record<string, string> = {};
    
    try {
      const translationPromises = Object.entries(texts).map(async ([key, text]) => {
        // Check cache first
        const cachedTranslation = getCachedTranslation(text, language);
        if (cachedTranslation) {
          translations[key] = cachedTranslation;
          return;
        }
        
        const translatedText = await translationService.translateText(text, language);
        cacheTranslation(text, language, translatedText);
        translations[key] = translatedText;
      });
      
      await Promise.all(translationPromises);
      return translations;
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts; // Return original texts on error
    }
  }, [preferredLanguage, translationCache]);

  return {
    preferredLanguage,
    setPreferredLanguage,
    translateText,
    translateTexts
  };
};
