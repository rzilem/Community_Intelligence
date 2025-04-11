
export async function createHomeownerRequest(requestData: Record<string, any>) {
  try {
    // Import the createClient function directly in the function
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.1.0");
    
    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Insert the homeowner request
    const { data, error } = await supabase
      .from("homeowner_requests")
      .insert(requestData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating homeowner request:", error);
      throw new Error(`Failed to create homeowner request: ${error.message}`);
    }
    
    // If the request had a tracking number, update the communications_log
    if (requestData.tracking_number) {
      await updateCommunicationWithRequestId(
        supabase,
        requestData.tracking_number,
        data.id
      );
    }
    
    return data;
  } catch (error) {
    console.error("Error in createHomeownerRequest:", error);
    throw error;
  }
}

async function updateCommunicationWithRequestId(
  supabase: any,
  trackingNumber: string,
  requestId: string
) {
  try {
    const { error } = await supabase
      .from("communications_log")
      .update({ 
        homeowner_request_id: requestId,
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq("tracking_number", trackingNumber);
    
    if (error) {
      console.error("Error updating communication log:", error);
      // Non-fatal error, log but don't throw
    }
  } catch (error) {
    console.error("Error in updateCommunicationWithRequestId:", error);
    // Non-fatal error, log but don't throw
  }
}
