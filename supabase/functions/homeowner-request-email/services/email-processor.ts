
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export async function extractRequestData(emailData: any, trackingNumber: string) {
  console.log("Extracting request data from email");
  
  // Initialize request with default values
  const requestData: Record<string, any> = {
    title: emailData.subject || "Email Request",
    status: "open",
    priority: "medium",
    type: "general",
    html_content: emailData.html || "",
    tracking_number: trackingNumber,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    // Extract content from HTML or fallback to text content
    let content = emailData.text || "";
    
    if (emailData.html) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(emailData.html, "text/html");
        if (doc && doc.body) {
          content = doc.body.textContent || emailData.text || "";
        }
      } catch (error) {
        console.error("Error parsing HTML:", error);
      }
    }
    
    // Set the description from the content
    requestData.description = content;
    
    // Try to detect request type from subject and content
    requestData.type = detectRequestType(emailData.subject, content);
    
    // Try to detect priority from subject and content
    requestData.priority = detectPriority(emailData.subject, content);
    
    // If the subject is too long, truncate it for the title
    if (requestData.title.length > 100) {
      requestData.title = requestData.title.substring(0, 97) + "...";
    }
    
    // Try to extract association ID (would need to be configured in a real app)
    // For now, we'll use a placeholder or you can add more sophisticated matching
    requestData.association_id = await getDefaultAssociationId();
    
    // Similarly for property_id - in a real app, you might parse the email 
    // to identify which property it's related to
    requestData.property_id = await getDefaultPropertyId(requestData.association_id);
    
    console.log("Extracted request data:", requestData);
    return requestData;
  } catch (error) {
    console.error("Error extracting request data:", error);
    throw new Error(`Failed to extract request data: ${error.message}`);
  }
}

// Simple function to detect request type based on content
function detectRequestType(subject: string, content: string): string {
  const combinedText = `${subject} ${content}`.toLowerCase();
  
  if (combinedText.includes("maintenance") || 
      combinedText.includes("repair") || 
      combinedText.includes("broken") ||
      combinedText.includes("fix") ||
      combinedText.includes("leak")) {
    return "maintenance";
  }
  
  if (combinedText.includes("violation") || 
      combinedText.includes("compliance") || 
      combinedText.includes("rule") ||
      combinedText.includes("regulation")) {
    return "compliance";
  }
  
  if (combinedText.includes("payment") || 
      combinedText.includes("invoice") || 
      combinedText.includes("bill") ||
      combinedText.includes("fee") ||
      combinedText.includes("dues")) {
    return "billing";
  }
  
  if (combinedText.includes("pool") || 
      combinedText.includes("gym") || 
      combinedText.includes("facility") ||
      combinedText.includes("amenity") ||
      combinedText.includes("reservation")) {
    return "amenity";
  }
  
  return "general";
}

// Simple function to detect priority based on content
function detectPriority(subject: string, content: string): string {
  const combinedText = `${subject} ${content}`.toLowerCase();
  
  if (combinedText.includes("urgent") || 
      combinedText.includes("emergency") || 
      combinedText.includes("immediate") ||
      combinedText.includes("asap") ||
      combinedText.includes("critical")) {
    return "urgent";
  }
  
  if (combinedText.includes("high priority") || 
      combinedText.includes("important") || 
      combinedText.includes("soon")) {
    return "high";
  }
  
  if (combinedText.includes("low priority") || 
      combinedText.includes("whenever") || 
      combinedText.includes("no rush")) {
    return "low";
  }
  
  return "medium";
}

// In a real app, you would have a more sophisticated way to determine
// which association an email belongs to. For now, we'll get the first one.
async function getDefaultAssociationId(): Promise<string> {
  try {
    // Import the createClient function directly in the function
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.1.0");
    
    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the first association
    const { data, error } = await supabase
      .from("associations")
      .select("id")
      .limit(1)
      .single();
    
    if (error) {
      console.error("Error getting default association:", error);
      throw new Error(`Failed to get default association: ${error.message}`);
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in getDefaultAssociationId:", error);
    throw error;
  }
}

// Similar function to get a default property ID
async function getDefaultPropertyId(associationId: string): Promise<string> {
  try {
    // Import the createClient function directly in the function
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.1.0");
    
    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the first property for the given association
    const { data, error } = await supabase
      .from("properties")
      .select("id")
      .eq("association_id", associationId)
      .limit(1)
      .single();
    
    if (error) {
      console.error("Error getting default property:", error);
      throw new Error(`Failed to get default property: ${error.message}`);
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in getDefaultPropertyId:", error);
    throw error;
  }
}
