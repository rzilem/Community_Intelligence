
/**
 * Service to create and manage homeowner requests in the database
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://cahergndkwfqltxyikyr.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create a Supabase client with the service role key for admin access
export async function createRequest(requestData: any) {
  console.log("Creating request with service role client");
  
  if (!supabaseServiceKey) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    throw new Error("Configuration error: Missing service role key");
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    console.log("Inserting request into homeowner_requests table");
    
    // Clean up requestData to ensure we only include valid fields
    // This ensures we don't try to insert undefined or null values for fields that require values
    const cleanRequestData = {
      title: requestData.title,
      description: requestData.description,
      type: requestData.type || 'general',
      priority: requestData.priority || 'medium',
      status: requestData.status || 'open',
      tracking_number: requestData.tracking_number,
      html_content: requestData.html_content,
    };
    
    // Only add these fields if they actually have values
    if (requestData.association_id) {
      cleanRequestData.association_id = requestData.association_id;
    }
    
    if (requestData.property_id) {
      cleanRequestData.property_id = requestData.property_id;
    }
    
    if (requestData.resident_id) {
      cleanRequestData.resident_id = requestData.resident_id;
    }
    
    // Insert the request into the database with only valid fields
    const { data, error } = await supabase
      .from("homeowner_requests")
      .insert(cleanRequestData)
      .select();
    
    if (error) {
      console.error("Error inserting homeowner request:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.error("No data returned after insert");
      throw new Error("Request was created but no data was returned");
    }
    
    console.log("Request created successfully:", data[0].id);
    
    // Log creation in communications_log table for tracking
    await logCommunication(supabase, data[0].id, requestData.tracking_number);
    
    return data[0];
  } catch (error) {
    console.error("Error in createRequest:", error);
    throw error;
  }
}

async function logCommunication(supabase: any, requestId: string, trackingNumber: string) {
  try {
    console.log("Logging communication for request:", requestId);
    
    const { error } = await supabase
      .from("communications_log")
      .insert({
        homeowner_request_id: requestId,
        communication_type: "email",
        tracking_number: trackingNumber,
        status: "processed",
        processed_at: new Date().toISOString(),
        metadata: { source: "email_webhook" }
      });
    
    if (error) {
      console.error("Error logging communication:", error);
      // Don't throw here, just log the error
    } else {
      console.log("Communication logged successfully");
    }
  } catch (logError) {
    console.error("Error in logCommunication:", logError);
    // Don't throw here, just log the error
  }
}
