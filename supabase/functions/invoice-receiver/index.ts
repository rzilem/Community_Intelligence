
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "./utils/cors-headers.ts";
import { processInvoiceEmail } from "./services/invoice-processor.ts";
import { generateRequestId } from "../shared/logging.ts";

console.log("Starting invoice-receiver with enhanced CloudMailin support");

try {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const webhookSecret = Deno.env.get("CLOUDMAILIN_WEBHOOK_SECRET");
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  console.log("Environment check:", {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    hasWebhookSecret: !!webhookSecret,
    hasOpenAiKey: !!openaiApiKey
  });

  const supabase = createClient(supabaseUrl, supabaseKey);

  serve(async (req) => {
    const requestId = generateRequestId();
    
    try {
      // Handle CORS preflight requests
      if (req.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      console.log(`[${requestId}] Received ${req.method} request`);
      
      // Enhanced authentication validation for CloudMailin
      const isAuthenticated = validateCloudMailinAuthentication(req, webhookSecret);
      
      if (!isAuthenticated) {
        console.log(`[${requestId}] Authentication failed`);
        logAuthenticationDetails(req, requestId);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Authentication failed - check webhook configuration",
            requestId,
            hint: "Ensure CloudMailin is configured with the correct authentication method"
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 401 
          }
        );
      }

      console.log(`[${requestId}] Authentication successful`);

      // Parse request body with enhanced CloudMailin support
      let emailData;
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('multipart/form-data')) {
        console.log(`[${requestId}] Processing CloudMailin multipart form data`);
        emailData = await parseCloudMailinData(req);
      } else {
        console.log(`[${requestId}] Processing JSON data`);
        emailData = await req.json();
      }

      console.log(`[${requestId}] Email data parsed - keys:`, Object.keys(emailData));
      
      // Generate tracking number
      const { data: trackingData, error: trackingError } = await supabase.rpc('get_next_tracking_number');
      
      if (trackingError) {
        console.error(`[${requestId}] Error generating tracking number:`, trackingError);
        throw trackingError;
      }

      const trackingNumber = `EMAIL-${trackingData}`;
      emailData.tracking_number = trackingNumber;

      console.log(`[${requestId}] Generated tracking number: ${trackingNumber}`);

      // Store communication log with enhanced metadata
      const { error: logError } = await supabase
        .from('communications_log')
        .insert({
          tracking_number: trackingNumber,
          communication_type: 'email',
          metadata: {
            from: emailData.from || emailData.From,
            to: emailData.to || emailData.To,
            subject: emailData.subject || emailData.Subject,
            processed_by: 'invoice-receiver',
            request_id: requestId,
            has_attachments: !!(emailData.attachments && emailData.attachments.length > 0),
            content_type: contentType,
            authentication_method: getAuthenticationMethod(req)
          },
          status: 'received'
        });

      if (logError) {
        console.error(`[${requestId}] Error storing communication log:`, logError);
      }

      // Process the invoice
      console.log(`[${requestId}] Starting invoice processing with AI analysis`);
      const processedInvoice = await processInvoiceEmail(emailData);
      
      // Store the invoice in the database
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          tracking_number: trackingNumber,
          ...processedInvoice,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (invoiceError) {
        console.error(`[${requestId}] Error storing invoice:`, invoiceError);
        
        // Update communication log status
        await supabase
          .from('communications_log')
          .update({ 
            status: 'failed', 
            metadata: { 
              error: invoiceError.message,
              processing_stage: 'database_storage'
            }
          })
          .eq('tracking_number', trackingNumber);
        
        throw invoiceError;
      }

      console.log(`[${requestId}] Invoice stored successfully:`, invoiceData.id);

      // Update communication log status
      await supabase
        .from('communications_log')
        .update({ 
          status: 'completed',
          metadata: { 
            invoice_id: invoiceData.id,
            processed_successfully: true,
            ai_processing_completed: true
          }
        })
        .eq('tracking_number', trackingNumber);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Invoice processed successfully with AI analysis",
          tracking_number: trackingNumber,
          invoice_id: invoiceData.id,
          requestId
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201
        }
      );

    } catch (error: any) {
      console.error(`[${requestId}] Error processing invoice:`, error);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "Unknown error",
          requestId,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }
  });

} catch (initError) {
  console.error("Initialization failed:", initError.message);
  throw new Error(`Invoice receiver failed to start: ${initError.message}`);
}

/**
 * Enhanced CloudMailin authentication validation
 */
function validateCloudMailinAuthentication(request: Request, expectedSecret?: string): boolean {
  if (!expectedSecret) {
    console.warn("No webhook secret configured - running in development mode");
    return true;
  }

  // Method 1: Custom Header (Recommended)
  const customSignature = request.headers.get('x-webhook-signature') || 
                          request.headers.get('X-Webhook-Signature');
  
  if (customSignature && secureCompare(customSignature, expectedSecret)) {
    console.log("Authentication successful via custom header");
    return true;
  }

  // Method 2: HTTP Basic Auth
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Basic ')) {
    const base64Credentials = authHeader.substring(6);
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(':');
    
    if (username === 'cloudmailin' && secureCompare(password, expectedSecret)) {
      console.log("Authentication successful via HTTP Basic Auth");
      return true;
    }
  }

  // Method 3: Bearer Token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (secureCompare(token, expectedSecret)) {
      console.log("Authentication successful via Bearer token");
      return true;
    }
  }

  return false;
}

/**
 * Secure constant-time string comparison
 */
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Parse CloudMailin multipart form data
 */
async function parseCloudMailinData(request: Request): Promise<any> {
  const formData = await request.formData();
  const result: any = {};
  
  console.log("CloudMailin form data keys:", Array.from(formData.keys()));
  
  for (const [key, value] of formData.entries()) {
    if (key.includes('attachment') || key === 'attachments' || key === 'attachments[]') {
      if (!result.attachments) result.attachments = [];
      
      if (value instanceof File || value instanceof Blob) {
        const fileName = value instanceof File ? value.name : key;
        const contentType = value instanceof File ? value.type : 'application/octet-stream';
        
        result.attachments.push({
          filename: fileName,
          contentType: contentType,
          content: value,
          size: value.size
        });
      }
    } else if (typeof value === "string") {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }
  
  console.log(`Parsed CloudMailin data with ${result.attachments?.length || 0} attachments`);
  return result;
}

/**
 * Get authentication method used for logging
 */
function getAuthenticationMethod(request: Request): string {
  if (request.headers.get('x-webhook-signature')) return 'custom_header';
  
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Basic ')) return 'http_basic';
  if (authHeader?.startsWith('Bearer ')) return 'bearer_token';
  
  return 'none';
}

/**
 * Log authentication details for debugging
 */
function logAuthenticationDetails(request: Request, requestId: string): void {
  const headers = {
    'x-webhook-signature': request.headers.get('x-webhook-signature') ? 'present' : 'missing',
    'authorization': request.headers.get('authorization') ? 'present' : 'missing',
    'content-type': request.headers.get('content-type') || 'missing',
    'user-agent': request.headers.get('user-agent') || 'missing'
  };
  
  console.log(`[${requestId}] Authentication debug info:`, headers);
}
