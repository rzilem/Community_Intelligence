
/**
 * Service for handling translations across the application
 * Currently disabled to prevent crashes
 */
export const translationService = {
  translateText: async (text: string, targetLanguage: string): Promise<string> => {
    // Translation functionality temporarily disabled
    return text; // Return original text without translation
  },
  
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
  
  updateUserLanguagePreference: async (userId: string, languageCode: string): Promise<void> => {
    if (!userId) return;
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: languageCode })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating language preference:', error);
      // We're suppressing errors to prevent crashes
    }
  }
};
