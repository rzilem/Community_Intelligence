
import { createAuthorizedFetch } from "../../shared/authorized-fetch.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

/**
 * Analyzes homeowner request content using OpenAI to extract structured information
 * 
 * @param content The text content of the request
 * @param subject The email subject (if available)
 * @param from The sender email address (if available)
 * @returns Structured request data
 */
export async function analyzeRequestWithAI(
  content: string,
  subject: string = "",
  from: string = ""
): Promise<Record<string, any> | null> {
  // Skip AI analysis if no API key is available
  if (!OPENAI_API_KEY) {
    console.log("OpenAI API key not configured, skipping AI analysis");
    return null;
  }

  try {
    console.log("Sending homeowner request content to OpenAI extractor function");
    
    // Verify environment variables are set
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
      return null;
    }
    
    if (!SUPABASE_URL) {
      console.error("SUPABASE_URL is not set");
      return null;
    }
    
    // Create an authorized fetch function
    const fetchWithAuth = createAuthorizedFetch(SUPABASE_SERVICE_ROLE_KEY);
    
    // Log details about the request we're about to make
    console.log("OpenAI extractor request details:", {
      url: `${SUPABASE_URL}/functions/v1/openai-extractor`,
      contentType: "homeowner-request",
      contentLength: content.length,
      hasSubject: !!subject,
      hasFrom: !!from,
      serviceRoleKeyProvided: !!SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleKeyLength: SUPABASE_SERVICE_ROLE_KEY?.length || 0
    });
    
    // Call the unified OpenAI extractor function with the authorized fetch
    const response = await fetchWithAuth(`${SUPABASE_URL}/functions/v1/openai-extractor`, {
      method: "POST",
      body: JSON.stringify({
        content: content,
        contentType: "homeowner-request",
        metadata: { subject, from },
        apiKey: OPENAI_API_KEY // Pass the OpenAI API key in the request body
      })
    });

    // Log the response status
    console.log(`OpenAI extractor response status: ${response.status}`);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.text();
      } catch (e) {
        errorData = "Could not parse response body";
      }
      
      throw new Error(`OpenAI extractor API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error("AI extraction failed:", data.error);
      return null;
    }
    
    const extractedData = data.extractedData;
    console.log("AI extracted homeowner request data:", extractedData);
    
    // Add confidence information to the extracted data
    extractedData._aiConfidence = data.confidence || {};
    
    return extractedData;
  } catch (error) {
    console.error("Error calling OpenAI extractor API:", error);
    return null;
  }
}
