
export async function getNextTrackingNumber(): Promise<string> {
  try {
    // Import the createClient function directly in the function
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.1.0");
    
    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Call the database function to get the next tracking number
    const { data, error } = await supabase.rpc('get_next_tracking_number');
    
    if (error) {
      console.error('Error getting next tracking number:', error);
      throw error;
    }
    
    const trackingNumber = `HR-${String(data).padStart(6, '0')}`;
    console.log(`Generated tracking number: ${trackingNumber}`);
    return trackingNumber;
  } catch (error) {
    console.error('Error in getNextTrackingNumber:', error);
    throw error;
  }
}

export async function registerCommunication(
  trackingNumber: string, 
  communicationType: 'email' | 'web' | 'api', 
  metadata: Record<string, any>
): Promise<any> {
  try {
    // Import the createClient function directly in the function
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.1.0");
    
    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Insert the communication log entry
    const { data, error } = await supabase
      .from("communications_log")
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
      throw error;
    }
    
    console.log(`Registered ${communicationType} communication with tracking number: ${trackingNumber}`);
    return data;
  } catch (error) {
    console.error('Error in registerCommunication:', error);
    throw error;
  }
}
