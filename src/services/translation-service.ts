import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling translations across the application
 */
export const translationService = {
  /**
   * Translates text using OpenAI API through a Supabase edge function
   * @param text The text to translate
   * @param targetLanguage The target language code (e.g., 'es', 'fr')
   * @returns Translated text
   */
  translateText: async (text: string, targetLanguage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text, targetLanguage }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data?.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  },
  
  /**
   * Gets supported languages for the application
   * @returns Array of language options
   */
  getSupportedLanguages: () => {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'zh', name: 'Chinese (Simplified)' },
      { code: 'ar', name: 'Arabic' },
      { code: 'ru', name: 'Russian' },
      { code: 'hi', name: 'Hindi' }
    ];
  },
  
  /**
   * Updates user's language preference
   * @param userId User ID
   * @param languageCode Language code to set as preference
   */
  updateUserLanguagePreference: async (userId: string, languageCode: string): Promise<void> => {
    if (!userId) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ preferred_language: languageCode })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating language preference:', error);
    }
  },

  /**
   * Store a translated message in the database
   */
  storeTranslation: async (
    messageId: string, 
    originalText: string, 
    translatedText: string, 
    targetLanguage: string
  ): Promise<void> => {
    try {
      await supabase
        .from('message_translations')
        .insert({
          message_id: messageId,
          original_text: originalText,
          translated_text: translatedText,
          language_code: targetLanguage
        });
    } catch (error) {
      console.error('Error storing translation:', error);
    }
  },

  /**
   * Retrieve a stored translation
   */
  getStoredTranslation: async (
    messageId: string, 
    targetLanguage: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('message_translations')
        .select('translated_text')
        .eq('message_id', messageId)
        .eq('language_code', targetLanguage)
        .single();

      if (error) return null;
      return data?.translated_text || null;
    } catch (error) {
      console.error('Error retrieving translation:', error);
      return null;
    }
  }
};
