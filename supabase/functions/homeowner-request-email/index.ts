
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { processEmailData } from "./services/email-processor.ts";
import { createRequest } from "./services/request-service.ts";
import { corsHeaders } from "./utils/cors-headers.ts";
import { processMultipartFormData, normalizeEmailData } from "./utils/request-parser.ts";
import { validateWebhookSecret, getRequestLogInfo } from "../shared/webhook-auth.ts";
import { validateCloudMailinAuth, getCloudMailinAuthConfig, isCloudMailinRequest } from "../shared/cloudmailin-auth.ts";
import { createLogger, generateRequestId } from "../shared/logging.ts";

serve(async (req) => {
  // Generate a unique request ID
  const requestId = generateRequestId();
  const logger = createLogger("homeowner-request-email");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    await logger.info(requestId, "Received homeowner request email webhook");
    
    // Log the request information
    const requestInfo = getRequestLogInfo(req);
    await logger.info(requestId, "Request details", requestInfo);
    
    // Determine authentication method based on request source
    const isCloudMailin = isCloudMailinRequest(req);
    let isValidWebhook = false;
    
    if (isCloudMailin) {
      // Use CloudMailin-specific authentication
      const cloudmailinConfig = getCloudMailinAuthConfig();
      isValidWebhook = validateCloudMailinAuth(req, cloudmailinConfig);
      await logger.info(requestId, "CloudMailin authentication check", { 
        isValid: isValidWebhook,
        hasUsername: !!cloudmailinConfig.username,
        hasPassword: !!cloudmailinConfig.password,
        hasSecret: !!cloudmailinConfig.secret
      });
    } else {
      // Use standard webhook authentication
      const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
      isValidWebhook = validateWebhookSecret(req, webhookSecret);
      await logger.info(requestId, "Standard webhook authentication check", { 
        isValid: isValidWebhook,
        hasSecret: !!webhookSecret
      });
    }
    
    // For development/testing, allow requests without authentication if no secrets are configured
    const cloudmailinConfig = getCloudMailinAuthConfig();
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    const hasAnyAuth = !!(cloudmailinConfig.username || cloudmailinConfig.secret || webhookSecret);
    
    if (!isValidWebhook && hasAnyAuth) {
      await logger.error(requestId, "Webhook authentication failed", 
        new Error("Missing or invalid authentication"),
        { 
          isCloudMailin,
          hasWebhookAuth: !!req.headers.get('authorization'),
          hasWebhookKey: !!req.headers.get('x-webhook-key'),
          hasCloudMailinSig: !!req.headers.get('x-cloudmailin-signature')
        }
      );
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Unauthorized webhook request",
          requestId,
          authMethod: isCloudMailin ? 'cloudmailin' : 'standard'
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }
    
    if (!isValidWebhook && !hasAnyAuth) {
      await logger.info(requestId, "Processing request without authentication (no secrets configured)");
    }
    
    // Get email data from request - handle both JSON and multipart form data
    let emailData;
    
    try {
      // Try to process the request using our multipart form data processor first
      emailData = await processMultipartFormData(req);
      await logger.info(requestId, "Successfully processed multipart form data");
    } catch (parseError) {
      await logger.error(requestId, "Error parsing request as multipart form data", parseError);
      
      // Clone the request before attempting to parse as JSON
      const clonedRequest = req.clone();
      
      try {
        // Fallback to regular JSON parsing
        emailData = await clonedRequest.json();
        await logger.info(requestId, "Successfully parsed request as JSON");
      } catch (jsonError) {
        await logger.error(requestId, "Error parsing request as JSON", jsonError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Invalid request format",
            message: "Could not parse request body as multipart form data or JSON",
            parseError: parseError.message,
            jsonError: jsonError.message,
            requestId
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }
    }

    // Validate we have at least some data to work with
    if (!emailData || (typeof emailData === 'object' && Object.keys(emailData).length === 0)) {
      await logger.error(requestId, "Empty email data received");
      return new Response(
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
      );
    }
    
    // Normalize the email data to handle different formats
    const normalizedEmailData = normalizeEmailData(emailData);
    await logger.info(requestId, "Processing normalized email data", {
      subject: normalizedEmailData.subject,
      from: normalizedEmailData.from,
      hasHtml: !!normalizedEmailData.html,
      hasAttachments: normalizedEmailData.attachments?.length > 0
    });

    // Process the email to extract request information
    await logger.info(requestId, "Extracting request information from email");
    const requestData = await processEmailData(normalizedEmailData);

    // Create the homeowner request in the database
    await logger.info(requestId, "Creating homeowner request with the extracted data", {
      title: requestData.title,
      type: requestData.type,
      priority: requestData.priority
    });
    
    const request = await createRequest(requestData);
    await logger.info(requestId, "Homeowner request created successfully", {
      requestId: request.id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Homeowner request created", 
        request,
        trackingId: requestId
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201 
      }
    );
  } catch (error: any) {
    await logger.error(requestId, "Error handling homeowner request email", error);
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
});
