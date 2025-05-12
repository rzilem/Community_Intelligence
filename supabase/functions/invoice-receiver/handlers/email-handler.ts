
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { processMultipartFormData } from "../utils/request-parser.ts";
import { LoggingService } from "../services/logging-service.ts";
import { corsHeaders } from "../utils/cors-headers.ts";
import { handleEmailData } from "../services/email-processor.ts";
import { processAttachments } from "../services/attachment-processor.ts";
import { storeInvoice } from "../services/invoice-service.ts";
import { validateWebhookSecret, getRequestLogInfo } from "../../shared/webhook-auth.ts";
import { generateRequestId } from "../../shared/logging.ts";

export async function handleInvoiceEmail(req: Request, supabase: any): Promise<Response> {
  // Generate a unique request ID for tracking
  const requestId = generateRequestId();
  const loggingService = new LoggingService(supabase);
  
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    // Log the request information for debugging
    const requestInfo = getRequestLogInfo(req);
    await loggingService.logInfo(requestId, "Received invoice email webhook", requestInfo);
    
    // Check webhook authentication
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET") || Deno.env.get("CLOUDMAILIN_SECRET");
    const isValidWebhook = validateWebhookSecret(req, webhookSecret);
    
    if (!isValidWebhook && !req.headers.has("authorization")) {
      await loggingService.logError(requestId, "Webhook authentication failed", 
        new Error("Missing or invalid webhook signature"),
        { hasWebhookKey: !!req.headers.get('x-webhook-key') || !!req.headers.get('webhook-signature') }
      );
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Unauthorized webhook request",
          requestId
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }
    
    // Log environment configuration (without exposing secrets)
    await loggingService.logInfo(requestId, "Environment configuration check", { 
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      hasSupabaseServiceKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      hasOpenAIKey: !!Deno.env.get("OPENAI_API_KEY"),
      hasWebhookSecret: !!webhookSecret
    });
    
    // Get email data from request - handle both JSON and multipart form data
    const emailData = await parseRequestData(req, requestId, loggingService);
    if (!emailData.success) {
      return emailData.response!;
    }

    // Process the email data
    const processedEmailData = await handleEmailData(emailData.data, requestId, loggingService, supabase);
    if (!processedEmailData.success) {
      return processedEmailData.response!;
    }

    // Store the invoice
    const invoiceResult = await storeInvoice(processedEmailData.invoiceData, requestId, loggingService, supabase);
    
    return new Response(
      JSON.stringify({
        ...invoiceResult,
        requestId
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: invoiceResult.success ? 201 : 500
      }
    );
  } catch (error: any) {
    await loggingService.logError(requestId, "Unhandled error processing invoice email", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error",
        requestId
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
}

async function parseRequestData(req: Request, requestId: string, loggingService: LoggingService) {
  try {
    const emailData = await processMultipartFormData(req);
    await loggingService.logInfo(requestId, "Successfully processed request data", { 
      dataType: "multipart", 
      keysFound: Object.keys(emailData) 
    });
    
    // Validate we have at least some data to work with
    if (!emailData || (typeof emailData === 'object' && Object.keys(emailData).length === 0)) {
      await loggingService.logError(requestId, "Empty email data received", new Error("Email webhook payload was empty"));
      return {
        success: false,
        response: new Response(
          JSON.stringify({ 
            success: false, 
            error: "Empty email data", 
            details: "The email webhook payload was empty or invalid",
            requestId
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        )
      };
    }
    
    return { success: true, data: emailData };
  } catch (parseError) {
    await loggingService.logError(requestId, "Error parsing request", parseError);
    
    // Clone the request before attempting to parse as JSON
    const clonedRequest = req.clone();
    
    try {
      // Fallback to regular JSON parsing
      const emailData = await clonedRequest.json();
      await loggingService.logInfo(requestId, "Successfully parsed request as JSON");
      return { success: true, data: emailData };
    } catch (jsonError) {
      await loggingService.logError(requestId, "Error parsing request as JSON", jsonError);
      return {
        success: false,
        response: new Response(
          JSON.stringify({ 
            success: false, 
            error: "Invalid request format",
            message: "Could not parse request body as multipart form data or JSON",
            requestId
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        )
      };
    }
  }
}
