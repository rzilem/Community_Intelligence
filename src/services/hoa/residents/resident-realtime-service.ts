
import { supabase } from '@/integrations/supabase/client';

/**
 * Enables real-time updates for resident data
 */
export const enableRealtimeForResidents = () => {
  try {
    // Use Supabase's built-in channel functionality
    const channel = supabase
      .channel('residents-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'residents'
      }, (payload) => {
        console.log('Realtime update for residents:', payload);
      })
      .subscribe();
    
    console.log('Realtime updates for residents enabled successfully');
    
    // Return the channel so it could be unsubscribed if needed
    return channel;
  } catch (error) {
    console.error('Error setting up realtime for residents:', error);
  }
};

// Initialize realtime updates when this module is loaded
export const residentsChannel = enableRealtimeForResidents();
