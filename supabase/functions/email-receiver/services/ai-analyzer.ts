
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

/**
 * Analyzes lead email content using OpenAI to extract structured information
 * 
 * @param content The text content of the email
 * @param subject The email subject (if available)
 * @param from The sender email address (if available)
 * @returns Structured lead data
 */
export async function analyzeLeadWithAI(
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
    console.log("Sending lead content to OpenAI extractor function");
    
    // Call the unified OpenAI extractor function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-extractor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        content: content,
        contentType: "lead",
        metadata: { subject, from }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI extractor API error: ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error("AI extraction failed:", data.error);
      return null;
    }
    
    const extractedData = data.extractedData;
    console.log("AI extracted lead data:", extractedData);
    
    // Add confidence information to the extracted data
    extractedData._aiConfidence = data.confidence || {};
    
    return extractedData;
  } catch (error) {
    console.error("Error calling OpenAI extractor API:", error);
    return null;
  }
}
