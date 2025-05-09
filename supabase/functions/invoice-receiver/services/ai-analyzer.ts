
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

/**
 * Analyzes invoice content using OpenAI to extract structured information
 * 
 * @param content The text content of the invoice
 * @param subject The email subject (if available)
 * @param from The sender email address (if available)
 * @returns Structured invoice data
 */
export async function analyzeInvoiceWithAI(
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
    console.log("Sending invoice content to OpenAI extractor function");
    
    // Call the unified OpenAI extractor function with the correct authorization header
    const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-extractor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        content: content,
        contentType: "invoice",
        metadata: { subject, from },
        apiKey: OPENAI_API_KEY // Pass the OpenAI API key in the request body
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI extractor API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error("AI extraction failed:", data.error);
      return null;
    }
    
    const extractedData = data.extractedData;
    console.log("AI extracted invoice data:", extractedData);
    
    // Convert amount to number if it's a string
    if (extractedData.amount && typeof extractedData.amount === 'string') {
      extractedData.amount = parseFloat(extractedData.amount.replace(/[^0-9.-]+/g, ''));
    }
    
    // Add confidence information to the extracted data
    extractedData._aiConfidence = data.confidence || {};
    
    return extractedData;
  } catch (error) {
    console.error("Error calling OpenAI extractor API:", error);
    return null;
  }
}
