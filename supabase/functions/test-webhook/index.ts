
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createLogger, generateRequestId } from "../shared/logging.ts";
import { validateWebhookSecret, getRequestLogInfo } from "../shared/webhook-auth.ts";

// Define CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-key, webhook-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

serve(async (req) => {
  // Generate unique request ID
  const requestId = generateRequestId();
  const logger = createLogger("test-webhook");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Log basic request info
    const requestInfo = getRequestLogInfo(req);
    await logger.info(requestId, "Received webhook test request", requestInfo);

    // Check environment
    const hasWebhookSecret = !!Deno.env.get("WEBHOOK_SECRET") || !!Deno.env.get("CLOUDMAILIN_SECRET");
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET") || Deno.env.get("CLOUDMAILIN_SECRET");
    
    // Test webhook authentication
    const isValidWebhook = validateWebhookSecret(req, webhookSecret);
    
    // Get detailed header information for diagnostics
    const headerDiagnostics: Record<string, string | null> = {
      'content-type': req.headers.get('content-type'),
      'has-authorization': req.headers.has('authorization') ? 'yes' : 'no',
      'has-webhook-key': req.headers.has('x-webhook-key') ? 'yes' : 'no',
      'has-webhook-signature': req.headers.has('webhook-signature') ? 'yes' : 'no',
    };
    
    // Prepare body data if available
    let bodyData = null;
    if (req.headers.get('content-type')?.includes('application/json')) {
      try {
        const clonedRequest = req.clone();
        bodyData = await clonedRequest.json();
      } catch (e) {
        bodyData = { error: "Could not parse JSON body" };
      }
    }
    
    // Create response data
    const responseData = {
      success: true,
      message: "Webhook diagnostic completed",
      requestId,
      authStatus: {
        hasWebhookSecret,
        isValidWebhook,
        authMethod: isValidWebhook 
          ? (req.headers.has('x-webhook-key') || req.headers.has('webhook-signature') 
             ? 'webhook-key' 
             : (req.headers.has('authorization') ? 'bearer-token' : 'none'))
          : 'none'
      },
      requestInfo: {
        method: req.method,
        url: req.url,
        headers: headerDiagnostics
      },
      bodyData,
      timestamp: new Date().toISOString()
    };
    
    // Log the diagnostic results
    await logger.info(requestId, "Webhook diagnostic results", responseData);

    // Return diagnostic information
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error: any) {
    // Log and return any errors
    await logger.error(requestId, "Error in webhook test function", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Webhook test failed",
        error: error.message,
        requestId,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
