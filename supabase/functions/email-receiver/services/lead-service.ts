
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Required environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not set");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Insert a new lead into the database
export async function createLead(leadData: any) {
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name: leadData.name,
      email: leadData.email,
      company: leadData.company,
      phone: leadData.phone,
      source: 'Email',
      status: 'new',
      notes: leadData.notes,
      html_content: leadData.html_content,
      association_name: leadData.association_name,
      association_type: leadData.association_type,
      current_management: leadData.current_management,
      number_of_units: leadData.number_of_units,
      first_name: leadData.first_name,
      last_name: leadData.last_name,
      street_address: leadData.street_address,
      city: leadData.city,
      state: leadData.state,
      zip: leadData.zip,
      additional_requirements: leadData.additional_requirements
    })
    .select()
    .single();

  if (error) {
    console.error("Error inserting lead into database:", error);
    throw error;
  }

  return lead;
}
