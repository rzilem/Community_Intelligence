
import { supabase } from '@/integrations/supabase/client';
import { CommunicationLogEntry } from '@/types/communication-types';

/**
 * Gets the communications log entries, optionally filtered by type
 */
export async function getCommunicationLogs(type?: string): Promise<CommunicationLogEntry[]> {
  try {
    let query = supabase
      .from('communications_log')
      .select('*');
    
    if (type) {
      query = query.eq('communication_type', type);
    }
    
    const { data, error } = await query.order('received_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching communication logs:', error);
      return [];
    }
    
    return data as CommunicationLogEntry[];
  } catch (error) {
    console.error('Error in getCommunicationLogs:', error);
    return [];
  }
}

/**
 * Gets a specific communication log by tracking number
 */
export async function getCommunicationLogByTrackingNumber(trackingNumber: string): Promise<CommunicationLogEntry | null> {
  try {
    const { data, error } = await supabase
      .from('communications_log')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .single();
    
    if (error) {
      console.error('Error fetching communication log:', error);
      return null;
    }
    
    return data as CommunicationLogEntry;
  } catch (error) {
    console.error('Error in getCommunicationLogByTrackingNumber:', error);
    return null;
  }
}

/**
 * Generates a new tracking number for various communication types.
 * Uses the NextVal database function.
 */
export async function getNextTrackingNumber(): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('get_next_tracking_number');
    
    if (error) {
      console.error('Error getting next tracking number:', error);
      throw error;
    }
    
    const trackingNumber = `CI-${String(data).padStart(6, '0')}`;
    console.log(`Generated tracking number: ${trackingNumber}`);
    return trackingNumber;
  } catch (error) {
    console.error('Error in getNextTrackingNumber:', error);
    throw error;
  }
}

/**
 * Registers a communication in the communications log
 */
export async function registerCommunication(
  trackingNumber: string, 
  communicationType: string, 
  metadata: Record<string, any>
): Promise<CommunicationLogEntry | null> {
  try {
    const { data, error } = await supabase
      .from('communications_log')
      .insert({
        tracking_number: trackingNumber,
        communication_type: communicationType,
        metadata,
        received_at: new Date().toISOString(),
        status: 'received'
      })
      .select()
      .single();
    
    if (error) {
      console.error(`Error registering ${communicationType} communication:`, error);
      return null;
    }
    
    console.log(`Registered ${communicationType} communication with tracking number: ${trackingNumber}`);
    return data as CommunicationLogEntry;
  } catch (error) {
    console.error('Error in registerCommunication:', error);
    return null;
  }
}

/**
 * Updates the status of a communication log entry
 */
export async function updateCommunicationStatus(
  trackingNumber: string, 
  status: 'received' | 'processing' | 'completed' | 'failed',
  processedDate?: Date
): Promise<boolean> {
  try {
    const updateObject: any = { status };
    
    if (status === 'completed' || status === 'failed') {
      updateObject.processed_at = processedDate || new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('communications_log')
      .update(updateObject)
      .eq('tracking_number', trackingNumber);
    
    if (error) {
      console.error('Error updating communication status:', error);
      return false;
    }
    
    console.log(`Updated communication ${trackingNumber} status to ${status}`);
    return true;
  } catch (error) {
    console.error('Error in updateCommunicationStatus:', error);
    return false;
  }
}
