
import { supabase } from '@/integrations/supabase/client';

// Add simple mock translations for cases where API is not available
const mockTranslations = {
  'es': {
    'Welcome back': 'Bienvenido de nuevo',
    'Homeowner Portal': 'Portal del Propietario',
    'Make a Payment': 'Hacer un Pago',
    'Submit a Request': 'Enviar una Solicitud',
    'Calendar': 'Calendario',
    'View Documents': 'Ver Documentos',
    'Community Updates': 'Actualizaciones de la Comunidad',
    'Latest announcements and news': 'Últimos anuncios y noticias',
    'Annual Meeting Scheduled': 'Reunión Anual Programada',
    'October 15, 2023 at 7:00 PM in the Community Center': '15 de octubre de 2023 a las 7:00 PM en el Centro Comunitario',
    'Pool Closing for Season': 'Cierre de la Piscina por Temporada',
    'The community pool will close for the season on September 30': 'La piscina comunitaria cerrará por temporada el 30 de septiembre',
    'Ask Community Intelligence': 'Pregunte a Community Intelligence',
    'Get instant answers about your community': 'Obtenga respuestas instantáneas sobre su comunidad',
    'Dashboard': 'Tablero',
    'Payments': 'Pagos',
    'Requests': 'Solicitudes',
    'Calendar & Events': 'Calendario y Eventos',
    'Directory': 'Directorio',
    'Documents': 'Documentos',
    'My Profile': 'Mi Perfil',
    'Portal Navigation': 'Navegación del Portal'
  },
  'fr': {
    'Welcome back': 'Bienvenue',
    'Homeowner Portal': 'Portail du Propriétaire',
    'Make a Payment': 'Effectuer un Paiement',
    'Submit a Request': 'Soumettre une Demande',
    'Calendar': 'Calendrier',
    'View Documents': 'Voir les Documents',
    'Community Updates': 'Mises à Jour Communautaires',
    'Latest announcements and news': 'Dernières annonces et nouvelles',
    'Annual Meeting Scheduled': 'Réunion Annuelle Programmée',
    'October 15, 2023 at 7:00 PM in the Community Center': '15 octobre 2023 à 19h00 au Centre Communautaire',
    'Pool Closing for Season': 'Fermeture de la Piscine pour la Saison',
    'The community pool will close for the season on September 30': 'La piscine communautaire fermera pour la saison le 30 septembre',
    'Ask Community Intelligence': 'Demandez à Community Intelligence',
    'Get instant answers about your community': 'Obtenez des réponses instantanées sur votre communauté',
    'Dashboard': 'Tableau de Bord',
    'Payments': 'Paiements',
    'Requests': 'Demandes',
    'Calendar & Events': 'Calendrier et Événements',
    'Directory': 'Annuaire',
    'Documents': 'Documents',
    'My Profile': 'Mon Profil',
    'Portal Navigation': 'Navigation du Portail'
  }
};

/**
 * Service for handling translations across the application
 */
export const translationService = {
  translateText: async (text: string, targetLanguage: string): Promise<string> => {
    // Skip translation if target language is English or text is empty
    if (targetLanguage === 'en' || !text) {
      return text;
    }
    
    // Use mock translations for testing if available
    if (mockTranslations[targetLanguage]?.[text]) {
      console.log(`Using mock translation for: "${text}" to ${targetLanguage}`);
      return mockTranslations[targetLanguage][text];
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text, targetLanguage }
      });
      
      if (error) {
        console.error('Translation API error:', error);
        throw new Error(error.message);
      }
      
      if (!data?.translatedText) {
        console.error('Translation missing in response:', data);
        throw new Error('No translation returned from API');
      }
      
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      
      // Fallback to mock translations if API fails
      if (mockTranslations[targetLanguage]?.[text]) {
        console.log(`Falling back to mock translation for: "${text}"`);
        return mockTranslations[targetLanguage][text];
      }
      
      return text; // Fallback to original text when all else fails
    }
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
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: languageCode })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating language preference:', error);
      throw error;
    }
  }
};
