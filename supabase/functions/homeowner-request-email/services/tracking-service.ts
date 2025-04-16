
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Gets the next tracking number from the database and increments it
 */
export async function getNextTrackingNumber(): Promise<string> {
  try {
    // Attempt to get and update the next tracking number atomically
    const { data, error } = await supabase.rpc('get_next_tracking_number');
    
    if (error) {
      console.error("Error getting next tracking number:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    // Format the tracking number with leading zeros to ensure consistent length
    // Format with HR prefix for Homeowner Requests
    const paddedNumber = data.toString().padStart(6, '0');
    const trackingNumber = `HR-${paddedNumber}`;
    
    console.log(`Generated new tracking number: ${trackingNumber}`);
    return trackingNumber;
  } catch (error) {
    console.error("Error in getNextTrackingNumber:", error);
    // Fallback in case of database error - generate a timestamp-based ID
    const timestamp = Date.now();
    const fallbackId = `HR-ERR-${timestamp}`;
    console.log(`Using fallback tracking number due to error: ${fallbackId}`);
    return fallbackId;
  }
}

/**
 * Registers a new communication in the system with the given tracking number and metadata
 */
export async function registerCommunication(
  trackingNumber: string, 
  type: 'email' | 'web' | 'api', 
  metadata: Record<string, any>
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("communications_log")
      .insert({
        tracking_number: trackingNumber,
        communication_type: type,
        metadata,
        received_at: new Date().toISOString(),
        status: 'received'
      })
      .select()
      .single();
    
    if (error) {
      console.error(`Error registering ${type} communication:`, error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`Registered ${type} communication with tracking number: ${trackingNumber}`);
    return data;
  } catch (error) {
    console.error('Error in registerCommunication:', error);
    // Log error but don't throw to prevent blocking the entire process
    console.error(`Failed to register ${type} communication with tracking number: ${trackingNumber}`);
    return null;
  }
}
