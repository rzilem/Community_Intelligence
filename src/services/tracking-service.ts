
import { supabase } from "@/integrations/supabase/client";
import { CommunicationLog } from "@/types/invoice-types";

/**
 * Fetches all communication logs from the system
 */
export async function getCommunicationLogs(): Promise<CommunicationLog[]> {
  const { data, error } = await supabase
    .from('communications_log')
    .select('*')
    .order('received_at', { ascending: false }) as { data: CommunicationLog[] | null, error: any };
  
  if (error) {
    console.error("Error fetching communication logs:", error);
    throw error;
  }
  
  return data || [];
}

/**
 * Fetches a specific communication log by tracking number
 */
export async function getCommunicationByTrackingNumber(trackingNumber: string): Promise<CommunicationLog | null> {
  const { data, error } = await supabase
    .from('communications_log')
    .select('*')
    .eq('tracking_number', trackingNumber)
    .single() as { data: CommunicationLog | null, error: any };
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error(`Error fetching communication with tracking number ${trackingNumber}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Updates the status of a communication log
 */
export async function updateCommunicationStatus(
  id: string, 
  status: 'received' | 'processing' | 'completed' | 'failed',
  processedAt?: string
): Promise<CommunicationLog> {
  const updateData: { 
    status: string; 
    processed_at?: string;
    updated_at: string;
  } = { 
    status, 
    updated_at: new Date().toISOString()
  };
  
  if (processedAt || status === 'completed') {
    updateData.processed_at = processedAt || new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('communications_log')
    .update(updateData)
    .eq('id', id)
    .select()
    .single() as { data: CommunicationLog | null, error: any };
  
  if (error) {
    console.error(`Error updating communication status for ID ${id}:`, error);
    throw error;
  }
  
  return data as CommunicationLog;
}

/**
 * Find an entity (invoice, lead, etc.) by its tracking number
 */
export async function findByTrackingNumber(trackingNumber: string): Promise<{
  type: string;
  data: any;
} | null> {
  // First, check communications_log to determine the type
  const { data: logEntry, error: logError } = await supabase
    .from('communications_log')
    .select('*')
    .eq('tracking_number', trackingNumber)
    .single() as { data: CommunicationLog | null, error: any };
  
  if (logError) {
    if (logError.code === 'PGRST116') {
      return null;
    }
    console.error("Error finding tracking number in logs:", logError);
    throw logError;
  }
  
  if (!logEntry) {
    return null;
  }
  
  // Now fetch the actual entity based on the type
  try {
    if (logEntry.communication_type === 'invoice') {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();
        
      if (error) throw error;
      return { type: 'invoice', data: invoice };
    } 
    else if (logEntry.communication_type === 'lead') {
      const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();
        
      if (error) throw error;
      return { type: 'lead', data: lead };
    }
    else {
      // For other types that might not have their own table yet
      return { type: logEntry.communication_type, data: logEntry.metadata };
    }
  } catch (error) {
    console.error(`Error fetching ${logEntry.communication_type} with tracking number ${trackingNumber}:`, error);
    throw error;
  }
}
