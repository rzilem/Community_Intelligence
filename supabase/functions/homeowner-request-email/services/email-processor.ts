
/**
 * Service to process email data and extract homeowner request information
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://cahergndkwfqltxyikyr.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create a Supabase client with the service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function processEmailData(emailData: any) {
  console.log("Processing email for homeowner request extraction");
  console.log("Email data received:", JSON.stringify({
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    has_html: !!emailData.html,
    has_text: !!emailData.text,
    attachments: emailData.attachments?.length || 0
  }, null, 2));
  
  // Extract the data we need to create a request
  const requestData: Record<string, any> = {
    title: emailData.subject || "Email Request",
    status: "open",
    priority: determinePriority(emailData.subject),
    type: determineRequestType(emailData.subject, emailData.text || "", emailData.html || ""),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tracking_number: emailData.tracking_number || `REQ-${Date.now()}`,
  };
  
  // Extract email content
  if (emailData.html) {
    // Store the full HTML content
    requestData.html_content = emailData.html;
    
    // Extract the text content for the description, properly cleaning it
    let textContent = cleanHtmlContent(emailData.html);
    requestData.description = textContent.substring(0, 500);
  } else if (emailData.text) {
    // If only text is available, use it directly
    requestData.description = emailData.text.substring(0, 500);
  } else {
    requestData.description = "Request submitted via email. No content provided.";
  }
  
  // Extract sender information for possible resident matching
  const senderEmail = extractSenderEmail(emailData.from || "");
  if (senderEmail) {
    requestData.sender_email = senderEmail;
    console.log("Extracted sender email:", senderEmail);
    
    // Try to match the email with an existing resident
    const residentInfo = await findResidentByEmail(senderEmail);
    if (residentInfo) {
      console.log("Found matching resident:", residentInfo.id);
      requestData.resident_id = residentInfo.id;
      
      // If the resident has a property, also associate the request with that property
      if (residentInfo.property_id) {
        console.log("Associating request with property:", residentInfo.property_id);
        requestData.property_id = residentInfo.property_id;
        
        // If the property belongs to an association, associate the request with that association
        if (residentInfo.association_id) {
          console.log("Associating request with association:", residentInfo.association_id);
          requestData.association_id = residentInfo.association_id;
        }
      }
    } else {
      console.log("No matching resident found for email:", senderEmail);
    }
  }
  
  // Default association ID if not set by resident lookup
  if (!requestData.association_id) {
    requestData.association_id = "85bdb4ea-4288-414d-8f17-83b4a33725b8"; // Default to Reeceville COA
    console.log("Using default association ID:", requestData.association_id);
  }
  
  // Handle attachments if present
  if (emailData.attachments && emailData.attachments.length > 0) {
    console.log(`Processing ${emailData.attachments.length} attachments`);
    // Store attachment metadata in the request
    requestData.attachment_data = emailData.attachments.map((attachment: any) => ({
      filename: attachment.filename,
      contentType: attachment.contentType,
      size: attachment.size
    }));
    
    // Include attachment info in description
    const attachmentInfo = emailData.attachments
      .map((a: any) => `${a.filename} (${a.contentType})`)
      .join(", ");
    
    requestData.description += `\n\nAttachments: ${attachmentInfo}`;
  }
  
  console.log("Extracted request data:", JSON.stringify(requestData, null, 2));
  return requestData;
}

/**
 * Lookup a resident by email and return their information
 */
async function findResidentByEmail(email: string) {
  try {
    // First, look for a direct match in the residents table
    const { data: directMatch, error: directError } = await supabase
      .from('residents')
      .select('id, property_id, email')
      .eq('email', email)
      .single();
      
    if (directMatch) {
      console.log("Found direct resident match:", directMatch);
      
      // Get the property information to find the association
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('association_id')
        .eq('id', directMatch.property_id)
        .single();
        
      return {
        ...directMatch,
        association_id: property?.association_id
      };
    }
    
    // If no direct match, check profiles with associations
    const { data: profileMatch, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();
      
    if (profileMatch) {
      console.log("Found user profile match:", profileMatch);
      
      // Check if the user is associated with any associations
      const { data: associations, error: assocError } = await supabase
        .from('association_users')
        .select('association_id')
        .eq('user_id', profileMatch.id)
        .limit(1);
        
      if (associations && associations.length > 0) {
        console.log("User has association:", associations[0].association_id);
        
        // Check if the user is a resident
        const { data: residents, error: residentError } = await supabase
          .from('residents')
          .select('id, property_id')
          .eq('user_id', profileMatch.id)
          .limit(1);
          
        if (residents && residents.length > 0) {
          return {
            id: residents[0].id,
            property_id: residents[0].property_id,
            association_id: associations[0].association_id
          };
        }
        
        // If not a resident but has association, just return the association
        return { 
          association_id: associations[0].association_id 
        };
      }
    }
    
    // No match found
    return null;
  } catch (error) {
    console.error("Error looking up resident by email:", error);
    return null;
  }
}

/**
 * Properly cleans HTML content, handling HTML entities and removing unwanted elements
 */
function cleanHtmlContent(htmlContent: string): string {
  // First remove common email client added elements that we don't want
  let cleaned = htmlContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')  // Remove style tags and content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags and content
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')     // Remove head section
    .replace(/<img[^>]*>/gi, '[Image]')               // Replace images with placeholder
    .replace(/<hr[^>]*>/gi, '---')                    // Replace horizontal rules with dashes
    .replace(/<br[^>]*>/gi, '\n')                     // Replace <br> with newlines
    .replace(/<div[^>]*>/gi, '')                      // Remove div opening tags
    .replace(/<\/div>/gi, '\n')                       // Replace closing divs with newlines
    .replace(/<p[^>]*>/gi, '')                        // Remove p opening tags
    .replace(/<\/p>/gi, '\n\n')                       // Replace closing p tags with double newlines
    .replace(/<[^>]*>/g, ' ')                         // Remove all other tags
    .replace(/&nbsp;/g, ' ')                          // Replace non-breaking spaces
    .replace(/&amp;/g, '&')                           // Replace &amp; with &
    .replace(/&lt;/g, '<')                            // Replace &lt; with <
    .replace(/&gt;/g, '>')                            // Replace &gt; with >
    .replace(/&quot;/g, '"')                          // Replace &quot; with "
    .replace(/&#39;/g, "'")                           // Replace &#39; with '
    .replace(/\n{3,}/g, '\n\n')                       // Replace 3+ consecutive newlines with 2
    .replace(/\s{2,}/g, ' ')                          // Replace 2+ consecutive spaces with 1
    .trim();                                          // Trim whitespace
  
  return cleaned;
}

function determinePriority(subject: string): string {
  if (!subject) return "medium";
  
  subject = subject.toLowerCase();
  
  if (subject.includes("urgent") || 
      subject.includes("emergency") || 
      subject.includes("immediate")) {
    return "urgent";
  } else if (subject.includes("important") || 
             subject.includes("high priority")) {
    return "high";
  } else if (subject.includes("low priority") || 
             subject.includes("minor")) {
    return "low";
  }
  
  return "medium";
}

function determineRequestType(subject: string, text: string, html: string): string {
  const combinedText = `${subject || ""} ${text || ""} ${html || ""}`.toLowerCase();
  
  if (combinedText.includes("maintenance") || 
      combinedText.includes("repair") || 
      combinedText.includes("broken") ||
      combinedText.includes("fix")) {
    return "maintenance";
  } else if (combinedText.includes("billing") || 
             combinedText.includes("payment") || 
             combinedText.includes("invoice") ||
             combinedText.includes("fee")) {
    return "billing";
  } else if (combinedText.includes("compliance") || 
             combinedText.includes("violation") || 
             combinedText.includes("rule") ||
             combinedText.includes("regulation")) {
    return "compliance";
  } else if (combinedText.includes("amenity") || 
             combinedText.includes("pool") || 
             combinedText.includes("gym") ||
             combinedText.includes("common area")) {
    return "amenity";
  }
  
  return "general";
}

function extractSenderEmail(fromHeader: string): string | null {
  if (!fromHeader) return null;
  
  // Simple regex to extract email from From header
  const emailMatch = fromHeader.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
  return emailMatch ? emailMatch[1] : null;
}
