
import { extractTrackingNumber } from "../utils/request-parser.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
  
  // Extract basic info from email with extensive sender email detection
  const { subject, from, text, html } = emailData;
  
  // Extract email using multiple methods to ensure we get it right
  let fromEmail = "";
  
  // Try structured properties first
  if (from?.address) {
    fromEmail = from.address;
  } else if (from?.email) {
    fromEmail = from.email;
  } 
  // Try to extract from string formats next
  else if (typeof from === 'string') {
    // Check for format "name <email@example.com>"
    const angleMatch = from.match(/<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/i);
    if (angleMatch) {
      fromEmail = angleMatch[1];
    } else {
      // Simple email pattern extraction
      const emailMatch = from.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
      if (emailMatch) {
        fromEmail = emailMatch[1];
      }
    }
  }
  
  // Check headers as a last resort
  if (!fromEmail && emailData.headers) {
    const fromHeader = emailData.headers.From || emailData.headers.from;
    if (fromHeader) {
      const headerMatch = fromHeader.match(/<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/i);
      if (headerMatch) {
        fromEmail = headerMatch[1];
      } else {
        const simpleMatch = fromHeader.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
        if (simpleMatch) {
          fromEmail = simpleMatch[1];
        }
      }
    }
  }
  
  const fromName = from?.name || "";
  
  console.log(`Email from: ${fromName} <${fromEmail}>`);
  
  // Generate a tracking number that includes the sender's email for easier tracking
  const baseTrackingNumber = extractTrackingNumber(subject, text) || 
    `HOR-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  // Include email in tracking number for better identification
  const tracking_number = fromEmail 
    ? `${baseTrackingNumber}-${fromEmail}`
    : baseTrackingNumber;
  
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
        console.log(`No resident found with exact email ${fromEmail}: ${error.message}`);
        
        // Try with a case-insensitive search as a fallback
        const { data: residents, error: insensitiveError } = await supabase
          .from('residents')
          .select('id, property_id, email')
          .ilike('email', fromEmail)
          .limit(1);
        
        if (!insensitiveError && residents && residents.length > 0) {
          console.log(`Found resident with case-insensitive email match: ${residents[0].id}`);
          resident_id = residents[0].id;
          property_id = residents[0].property_id;
        }
      } else if (resident) {
        console.log(`Found resident: ${resident.id}`);
        resident_id = resident.id;
        property_id = resident.property_id;
      }
      
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
