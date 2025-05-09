
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { analyzeRequestWithAI } from "./ai-analyzer.ts";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

export async function processEmailData(emailData: any): Promise<any> {
  console.log("Processing email data for homeowner request");
  
  // Extract basic information from email
  const from = emailData.from || emailData.From || emailData.sender || emailData.Sender || "";
  const subject = emailData.subject || emailData.Subject || "";
  const rawHtmlContent = emailData.html || emailData.Html || emailData.body || emailData.Body || "";
  const rawTextContent = emailData.text || emailData.Text || emailData.plain || emailData.Plain || "";
  
  // Default request data
  const requestData: any = {
    title: subject || "New Request",
    description: rawTextContent || "No content provided",
    status: "open",
    priority: "medium",
    type: "general",
    html_content: rawHtmlContent,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Extract email address from the "from" field
  const emailMatch = from.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;
  
  // If we have an email, try to find the resident in the database
  if (email) {
    try {
      const { data: residents, error } = await supabase
        .from('residents')
        .select('id, property_id, name')
        .eq('email', email)
        .limit(1);
      
      if (!error && residents && residents.length > 0) {
        const resident = residents[0];
        requestData.resident_id = resident.id;
        requestData.property_id = resident.property_id;
        
        // If the property has an association, include it
        if (resident.property_id) {
          const { data: property, error: propertyError } = await supabase
            .from('properties')
            .select('association_id')
            .eq('id', resident.property_id)
            .single();
          
          if (!propertyError && property) {
            requestData.association_id = property.association_id;
          }
        }
      }
    } catch (error) {
      console.error("Error looking up resident:", error);
    }
  }
  
  // Use the best available content for AI analysis
  const content = rawTextContent || rawHtmlContent || subject;
  
  // Enhance with AI analysis if content is available
  if (content) {
    try {
      console.log("Starting AI analysis of homeowner request content");
      const aiExtractedData = await analyzeRequestWithAI(content, subject, from);
      
      if (aiExtractedData) {
        console.log("AI analysis successful, enhancing request data");
        
        // Use AI-extracted fields to enhance the request data
        if (aiExtractedData.title) {
          requestData.title = aiExtractedData.title.substring(0, 100); // Limit title length
        }
        
        if (aiExtractedData.description && aiExtractedData.description.length > requestData.description.length) {
          requestData.description = aiExtractedData.description;
        }
        
        if (aiExtractedData.type && ['maintenance', 'compliance', 'billing', 'general', 'amenity'].includes(aiExtractedData.type.toLowerCase())) {
          requestData.type = aiExtractedData.type.toLowerCase();
        }
        
        if (aiExtractedData.priority && ['low', 'medium', 'high', 'urgent'].includes(aiExtractedData.priority.toLowerCase())) {
          requestData.priority = aiExtractedData.priority.toLowerCase();
        }
        
        // Store AI confidence data and other extracted information for future reference
        requestData._aiExtracted = true;
        
        if (aiExtractedData._aiConfidence) {
          requestData._aiConfidence = aiExtractedData._aiConfidence;
        }
        
        if (aiExtractedData.action_items) {
          requestData.action_items = aiExtractedData.action_items;
        }
        
        if (aiExtractedData.suggested_response) {
          requestData.suggested_response = aiExtractedData.suggested_response;
        }
      }
    } catch (aiError) {
      console.error("AI analysis error:", aiError);
      // Continue with basic extraction only, don't fail the process
    }
  }
  
  // Generate a tracking number
  requestData.tracking_number = `REQ-${Date.now().toString().slice(-6)}`;
  
  console.log("Final processed homeowner request data:", requestData);
  return requestData;
}
