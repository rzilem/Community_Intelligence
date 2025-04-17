
import { extractTrackingNumber } from "../utils/request-parser.ts";
import { createClient } from "@supabase/supabase-js";

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export interface RequestData {
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  html_content?: string;
  tracking_number?: string;
  resident_id?: string;
  property_id?: string;
  association_id?: string;
}

export async function processEmailData(emailData: any): Promise<RequestData> {
  console.log("Processing email data:", JSON.stringify(emailData, null, 2));
  
  // Extract basic info from email
  const { subject, from, text, html } = emailData;
  const fromEmail = from?.address || from?.email || "";
  const fromName = from?.name || "";
  
  console.log(`Email from: ${fromName} <${fromEmail}>`);
  
  // Generate a tracking number or extract from subject/body
  const tracking_number = extractTrackingNumber(subject, text) || 
    `HOR-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  // Set default priority and type
  let priority = "medium";
  let type = "general";
  
  // Check for keywords indicating urgency
  const urgentKeywords = ["urgent", "emergency", "immediate", "asap", "critical"];
  const urgentRegex = new RegExp(urgentKeywords.join("|"), "i");
  if (urgentRegex.test(subject) || urgentRegex.test(text)) {
    priority = "high";
  }
  
  // Try to determine the type based on keywords
  const typeKeywords = {
    maintenance: ["repair", "broken", "fix", "maintenance", "not working"],
    compliance: ["violation", "rule", "regulation", "compliance", "against policy"],
    billing: ["payment", "invoice", "bill", "dues", "fee", "charge", "assessment"],
    amenity: ["pool", "gym", "clubhouse", "facility", "common area", "tennis", "basketball"]
  };
  
  // Check for type keywords in subject and body
  for (const [requestType, keywords] of Object.entries(typeKeywords)) {
    const typeRegex = new RegExp(keywords.join("|"), "i");
    if (typeRegex.test(subject) || typeRegex.test(text)) {
      type = requestType;
      break;
    }
  }
  
  // Try to find a resident with this email address
  let resident_id;
  let property_id;
  let association_id;
  
  try {
    console.log(`Looking up resident with email: ${fromEmail}`);
    
    if (fromEmail) {
      const { data: resident, error } = await supabase
        .from('residents')
        .select('id, property_id, email')
        .eq('email', fromEmail)
        .limit(1)
        .single();
      
      if (error) {
        console.log(`No resident found with email ${fromEmail}: ${error.message}`);
      }
      
      if (resident) {
        console.log(`Found resident: ${resident.id}`);
        resident_id = resident.id;
        property_id = resident.property_id;
        
        // If we have a property, get its association
        if (property_id) {
          const { data: property, error: propertyError } = await supabase
            .from('properties')
            .select('association_id')
            .eq('id', property_id)
            .limit(1)
            .single();
          
          if (propertyError) {
            console.log(`Error fetching property ${property_id}: ${propertyError.message}`);
          }
          
          if (property) {
            console.log(`Found association: ${property.association_id}`);
            association_id = property.association_id;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error looking up resident:", error);
  }
  
  // Prepare request data
  const requestData: RequestData = {
    title: subject || "Email Request",
    description: text || "No text content provided",
    status: "open",
    priority,
    type,
    html_content: html,
    tracking_number,
    resident_id,
    property_id,
    association_id
  };
  
  console.log("Processed request data:", requestData);
  
  return requestData;
}
