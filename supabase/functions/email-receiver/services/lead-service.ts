
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getNextTrackingNumber, registerCommunication } from "./tracking-service.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Required environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not set");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Insert a new lead into the database
export async function createLead(leadData: any) {
  try {
    // Generate a tracking number for this lead
    const trackingNumber = await getNextTrackingNumber();
    
    // Add tracking number to lead data
    const aiConfidence = leadData._aiConfidence;
    const leadWithTracking: Record<string, any> = {
      ...leadData,
      tracking_number: trackingNumber,
    };

    if (aiConfidence) {
      leadWithTracking.ai_confidence = aiConfidence;
      leadWithTracking.ai_generated_fields = Object.keys(aiConfidence);
      delete leadWithTracking._aiConfidence;
    }
    
    const { data: lead, error } = await supabase
      .from('leads')
      .insert(leadWithTracking)
      .select()
      .single();

    if (error) {
      console.error("Error inserting lead into database:", error);
      throw error;
    }

    // Register this communication in the log
    await registerCommunication(trackingNumber, 'lead', {
      lead_id: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      association_name: lead.association_name
    });

    console.log(`Lead created successfully with tracking number: ${trackingNumber}`);
    return lead;
  } catch (error) {
    console.error("Error in createLead:", error);
    throw error;
  }
}
