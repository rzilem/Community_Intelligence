
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

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
    // Prepare the prompt with clear instructions
    const prompt = `
Extract the following information from this invoice email or document.
If you cannot find a specific field, leave it blank.
Return the data as a valid JSON object with these keys:

- invoice_number: The invoice number or reference number
- amount: The total amount due (as a number without currency symbols)
- invoice_date: The date of the invoice in YYYY-MM-DD format
- due_date: The payment due date in YYYY-MM-DD format
- vendor: The company or person who sent the invoice
- description: A brief description of what the invoice is for
- association_id: Any reference to an HOA or association

Email Subject: ${subject}
From: ${from}

Content:
${content.substring(0, 4000)} // Limiting content to prevent token limits
`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant specialized in extracting structured data from invoices and financial documents."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1, // Lower temperature for more deterministic results
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response
    try {
      // Extract JSON from the response in case the AI includes additional text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJson = JSON.parse(jsonMatch[0]);
        console.log("AI extracted data:", extractedJson);
        
        // Convert amount to number if it's a string
        if (extractedJson.amount && typeof extractedJson.amount === 'string') {
          extractedJson.amount = parseFloat(extractedJson.amount.replace(/[^0-9.-]+/g, ''));
        }
        
        return extractedJson;
      }
      return null;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw AI response:", aiResponse);
      return null;
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return null;
  }
}
