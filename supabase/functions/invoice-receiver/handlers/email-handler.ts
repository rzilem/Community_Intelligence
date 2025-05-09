
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { processMultipartFormData } from "../utils/request-parser.ts";
import { LoggingService } from "../services/logging-service.ts";
import { corsHeaders } from "../utils/cors-headers.ts";
import { handleEmailData } from "../services/email-processor.ts";
import { processAttachments } from "../services/attachment-processor.ts";
import { storeInvoice } from "../services/invoice-service.ts";
import { log } from "../utils/logging.ts";

export async function handleInvoiceEmail(req: Request, supabase: any): Promise<Response> {
  // Generate a unique request ID for tracking
  const requestId = crypto.randomUUID();
  const loggingService = new LoggingService(supabase);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Log the request headers for debugging (redact any sensitive information)
    const headersLog: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'authorization') {
        headersLog[key] = value.startsWith('Bearer ') ? 'Bearer [redacted]' : '[redacted]';
      } else {
        headersLog[key] = value;
      }
    });
    
    await loggingService.logInfo(requestId, "Received invoice email webhook", { 
      method: req.method,
      headers: headersLog,
      contentType: req.headers.get('content-type')
    });
    
    // Special handling for webhook requests from email providers
    // Check for webhook signatures or other verification methods
    const webhookKey = req.headers.get('x-webhook-key') || req.headers.get('webhook-signature');
    if (webhookKey) {
      await loggingService.logInfo(requestId, "Processing webhook request with custom authentication", {
        hasWebhookKey: true
      });
      // Future enhancement: Implement webhook signature validation here
    } else {
      await loggingService.logInfo(requestId, "Processing standard request", {
        hasWebhookKey: false,
        hasAuthorization: !!req.headers.get('authorization')
      });
    }
    
    // Log environment configuration (without exposing secrets)
    await loggingService.logInfo(requestId, "Environment configuration check", { 
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      hasSupabaseServiceKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      hasOpenAIKey: !!Deno.env.get("OPENAI_API_KEY")
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
      JSON.stringify(invoiceResult),
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
        error: error.message || "Unknown error" 
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
            details: "The email webhook payload was empty or invalid" 
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
            message: "Could not parse request body as multipart form data or JSON"
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
