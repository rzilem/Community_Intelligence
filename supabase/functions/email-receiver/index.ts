
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Required environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not set");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// CORS headers for browser-based requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process email and extract information
async function processEmail(emailData: any): Promise<{
  name: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
}> {
  console.log("Processing email data:", JSON.stringify(emailData, null, 2));

  let name = "";
  let email = "";
  let company = "";
  let phone = "";
  let notes = "";
  let textContent = "";
  let htmlContent = "";

  try {
    // Try to extract email from various possible locations in the payload
    if (emailData.envelope?.from) {
      email = emailData.envelope.from;
    } else if (emailData.envelope?.sender) {
      email = emailData.envelope.sender;
    } else if (emailData.headers?.from) {
      email = extractEmailFromHeader(emailData.headers.from);
    } else if (emailData.from) {
      email = extractEmailFromHeader(emailData.from);
    } else if (emailData.sender) {
      email = emailData.sender;
    } else if (emailData.reply_to) {
      email = emailData.reply_to;
    }

    console.log("Extracted email address:", email);
    
    // Validate the email address
    if (!isValidEmail(email)) {
      console.warn(`Warning: Invalid or missing email address. Using fallback. Found: '${email}'`);
      email = "unknown@example.com"; // Fallback email
    }

    // Extract name from various possible fields
    if (emailData.headers?.from) {
      name = extractNameFromHeader(emailData.headers.from);
    } else if (emailData.from) {
      name = extractNameFromHeader(emailData.from);
    } else {
      // Try to guess a name from the email
      const namePart = email.split('@')[0];
      name = namePart.replace(/[.+]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    }

    // Handle multipart content
    if (emailData.content && Array.isArray(emailData.content)) {
      for (const part of emailData.content) {
        if (part.type === "text/plain") {
          textContent = part.value || "";
        } else if (part.type === "text/html") {
          htmlContent = part.value || "";
        }
      }
    }

    // Extract notes from subject and body
    notes = "";
    if (emailData.subject) {
      notes = `Subject: ${emailData.subject}\n\n`;
    }

    // Use the text content if available, otherwise fallback to the text property
    if (textContent) {
      notes += textContent;
    } else if (emailData.text) {
      notes += emailData.text;
    } else if (htmlContent) {
      // If no plain text, use the HTML content but note that it's HTML
      notes += "(HTML content) " + htmlContent.replace(/<[^>]*>/g, ' ');
    } else if (emailData.html) {
      // Fallback to the html property
      notes += "(HTML content) " + emailData.html.replace(/<[^>]*>/g, ' ');
    }

    // Try to extract phone from the email body using regex
    const phoneRegex = /(\+?1[-\s.]?)?\(?([0-9]{3})\)?[-\s.]?([0-9]{3})[-\s.]?([0-9]{4})/;
    const phoneMatch = notes.match(phoneRegex);
    if (phoneMatch) {
      phone = phoneMatch[0];
    }

    // Try to extract company name if we can find a signature block
    const signatureMarkers = ["--", "Best regards", "Regards", "Sincerely", "Thank you"];
    let signatureIndex = -1;
    
    for (const marker of signatureMarkers) {
      const idx = notes.indexOf(marker);
      if (idx !== -1 && (signatureIndex === -1 || idx < signatureIndex)) {
        signatureIndex = idx;
      }
    }
    
    if (signatureIndex !== -1) {
      const signature = notes.substring(signatureIndex);
      const companyMatches = signature.match(/([A-Z][a-zA-Z\s]+)\s+(LLC|Inc|Ltd|Corp|Corporation|Company|Co)/);
      if (companyMatches) {
        company = companyMatches[0];
      }
    }
  } catch (error) {
    console.error("Error processing email:", error);
  }

  // If name is still empty, use the first part of the email address
  if (!name) {
    name = email.split('@')[0].replace(/[.+]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  }

  return {
    name,
    email,
    company,
    phone,
    notes: notes.substring(0, 1000) // Limit notes to 1000 characters
  };
}

// Helper function to extract email from header format like "Name <email@domain.com>"
function extractEmailFromHeader(header: string): string {
  if (!header) return "";
  
  const emailMatch = header.match(/<([^>]+)>/);
  if (emailMatch && emailMatch[1]) {
    return emailMatch[1].trim();
  }
  
  // If no <email> format found, try to extract something that looks like an email
  const simpleEmailMatch = header.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (simpleEmailMatch) {
    return simpleEmailMatch[0];
  }
  
  return header.trim();
}

// Helper function to extract name from header format like "Name <email@domain.com>"
function extractNameFromHeader(header: string): string {
  if (!header) return "";
  
  const nameMatch = header.match(/^([^<]+)</);
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1].trim();
  }
  
  return "";
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Process raw multipart form data using native FormData API
async function processMultipartFormData(request: Request): Promise<any> {
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.includes("multipart/form-data")) {
    return await request.json();
  }

  console.log("Processing multipart form data");
  const formData = await request.formData();
  const result: Record<string, any> = {};
  
  // Process each form field
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      try {
        // Try to parse JSON values
        result[key] = JSON.parse(value);
      } catch {
        // If not JSON, store as string
        result[key] = value;
      }
    } else {
      // Handle file data if needed
      result[key] = value;
    }
  }

  console.log("Processed form data:", result);
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Received request with content-type:", req.headers.get("content-type"));
    
    // Get email data from request - handle both JSON and multipart form data
    let emailData;
    
    try {
      emailData = await processMultipartFormData(req);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      try {
        // Fallback to regular JSON parsing
        emailData = await req.json();
      } catch (jsonError) {
        console.error("Error parsing request as JSON:", jsonError);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid request format" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }
    }
    
    console.log("Received email webhook:", JSON.stringify(emailData, null, 2));

    // Process the email to extract lead information
    const leadData = await processEmail(emailData);

    // Insert lead into the database
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name: leadData.name,
        email: leadData.email,
        company: leadData.company,
        phone: leadData.phone,
        source: 'Email',
        status: 'new',
        notes: leadData.notes
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting lead into database:", error);
      throw error;
    }

    console.log("Lead created successfully:", lead);

    return new Response(
      JSON.stringify({ success: true, message: "Lead created", lead }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error handling email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});

