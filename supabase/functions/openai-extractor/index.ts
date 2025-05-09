import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
let openAiApiKey = Deno.env.get("OPENAI_API_KEY");

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

interface ExtractRequest {
  content: string;
  contentType: 'invoice' | 'homeowner-request' | 'lead';
  metadata?: Record<string, any>;
  apiKey?: string; // Optional API key from request body
}

interface ExtractResponse {
  success: boolean;
  extractedData: Record<string, any>;
  confidence?: Record<string, number>;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request payload
    const { content, contentType, metadata = {}, apiKey } = await req.json() as ExtractRequest;
    
    // Use API key from request body if provided, otherwise use environment variable
    if (apiKey) {
      openAiApiKey = apiKey;
    }
    
    if (!openAiApiKey) {
      throw new Error("OpenAI API key not configured");
    }
    
    if (!content || !contentType) {
      throw new Error("Missing required parameters: content and contentType");
    }
    
    console.log(`Extracting data from ${contentType} content, length: ${content.length}`);
    
    // Select the appropriate prompt based on content type
    const prompt = getPromptForContentType(contentType, metadata);
    
    // Call OpenAI API
    const apiResponse = await callOpenAI(prompt, content);
    
    // Return the extracted data
    return new Response(JSON.stringify(apiResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Error in openai-extractor:", error);
    
    return new Response(JSON.stringify({
      success: false,
      extractedData: {},
      error: error.message || "Unknown error occurred"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});

// Get appropriate prompt based on content type
function getPromptForContentType(contentType: string, metadata: Record<string, any>): string {
  switch (contentType) {
    case 'invoice':
      return `
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
- line_items: Array of items with description and amount if present
- payment_terms: Any payment terms or instructions mentioned
- vendor_contact: Contact information for the vendor if available

Email Subject: ${metadata.subject || ''}
From: ${metadata.from || ''}
`;

    case 'homeowner-request':
      return `
Extract the following information from this homeowner request email or message.
If you cannot find a specific field, leave it blank.
Return the data as a valid JSON object with these keys:

- title: A concise title summarizing the request (max 100 characters)
- description: Detailed description of the issue or request
- type: The type of request (maintenance, compliance, billing, general, amenity)
- priority: Suggested priority level (low, medium, high, urgent) based on content
- property_info: Any reference to a specific property, unit number, or location
- resident_info: Any details about the resident/homeowner
- association_info: Any reference to an HOA or community name
- action_items: List of specific actions requested or required
- suggested_response: A brief suggested response to the request

Email Subject: ${metadata.subject || ''}
From: ${metadata.from || ''}
`;

    case 'lead':
      return `
Extract the following information from this potential lead inquiry or email.
If you cannot find a specific field, leave it blank.
Return the data as a valid JSON object with these keys:

- name: Full name of the person contacting
- first_name: First name if you can separate it
- last_name: Last name if you can separate it
- email: Email address of the contact
- phone: Phone number if available
- company: Company or organization name if mentioned
- association_name: Name of the HOA or association they represent
- association_type: Type of association (condo, single-family homes, etc.)
- number_of_units: Number of units or properties in the association
- current_management: Current property management company if mentioned
- location: Location details like city, state, address if mentioned
- requirements: Any specific requirements or services they're looking for
- source: How they found out about the service (if mentioned)

Email Subject: ${metadata.subject || ''}
From: ${metadata.from || ''}
`;

    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}

// Call OpenAI API to extract data
async function callOpenAI(prompt: string, content: string): Promise<ExtractResponse> {
  try {
    console.log("Calling OpenAI API with API key:", openAiApiKey ? "API key is set" : "No API key");
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant specialized in extracting structured data from documents, emails, and messages."
          },
          {
            role: "user",
            content: prompt + "\n\nContent:\n" + content.substring(0, 15000) // limiting content to prevent token limits
          }
        ],
        temperature: 0.1, // Lower temperature for more deterministic results
        max_tokens: 1000
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
        console.log("AI extracted data:", JSON.stringify(extractedJson, null, 2));
        
        return {
          success: true,
          extractedData: extractedJson,
          confidence: calculateConfidence(extractedJson)
        };
      }
      return {
        success: false,
        extractedData: {},
        error: "Failed to parse AI response as JSON"
      };
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw AI response:", aiResponse);
      return {
        success: false,
        extractedData: {},
        error: "Failed to parse AI response: " + parseError.message
      };
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return {
      success: false,
      extractedData: {},
      error: "Error calling OpenAI API: " + error.message
    };
  }
}

// Calculate confidence scores for extracted fields
function calculateConfidence(extractedData: Record<string, any>): Record<string, number> {
  const confidenceScores: Record<string, number> = {};
  
  // Simple heuristic: longer strings and more specific data get higher confidence
  Object.entries(extractedData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      if (!value) {
        confidenceScores[key] = 0;
      } else if (value.length < 3) {
        confidenceScores[key] = 0.5;
      } else if (value.length < 10) {
        confidenceScores[key] = 0.8;
      } else {
        confidenceScores[key] = 0.95;
      }
    } else if (Array.isArray(value)) {
      confidenceScores[key] = value.length > 0 ? 0.9 : 0.4;
    } else if (typeof value === 'number') {
      confidenceScores[key] = 0.9;
    } else {
      confidenceScores[key] = 0.7;
    }
  });
  
  return confidenceScores;
}
