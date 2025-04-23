
import { useState, useEffect } from 'react';
import { translationService } from '@/services/translation-service';
import { useAuth } from '@/contexts/auth';

export const useTranslation = () => {
  const { profile } = useAuth();
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferred_language || 'en');

  useEffect(() => {
    setPreferredLanguage(profile?.preferred_language || 'en');
  }, [profile]);

  const translateText = async (text: string, targetLanguage?: string) => {
    const language = targetLanguage || preferredLanguage;
    
    if (language === 'en') return text;

    try {
      const translatedText = await translationService.translateText(text, language);
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  return {
    preferredLanguage,
    translateText
  };
};
