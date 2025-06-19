
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "./utils/cors-headers.ts";
import { processInvoiceEmail } from "./services/invoice-processor.ts";
import { generateRequestId } from "../shared/logging.ts";

console.log("Starting invoice-receiver with CloudMailin support");

try {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const webhookSecret = Deno.env.get("CLOUDMAILIN_WEBHOOK_SECRET") || Deno.env.get("WEBHOOK_SECRET");
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
      
      // Log request headers for debugging
      const headers = Object.fromEntries(req.headers.entries());
      console.log(`[${requestId}] Request headers:`, {
        contentType: headers['content-type'],
        authorization: headers['authorization'] ? 'present' : 'missing',
        webhookSignature: headers['x-webhook-signature'] ? 'present' : 'missing',
        userAgent: headers['user-agent']
      });

      // Validate webhook authentication
      const authHeader = req.headers.get('authorization');
      const webhookSignature = req.headers.get('x-webhook-signature');
      
      if (webhookSecret && !authHeader && !webhookSignature) {
        console.log(`[${requestId}] Missing authentication - webhook secret configured but no auth header or signature found`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Missing authorization header or webhook signature",
            requestId
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 401 
          }
        );
      }

      // Parse request body
      let emailData;
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('multipart/form-data')) {
        console.log(`[${requestId}] Processing multipart form data`);
        const formData = await req.formData();
        emailData = {};
        
        // Convert FormData to object
        for (const [key, value] of formData.entries()) {
          if (typeof value === 'string') {
            emailData[key] = value;
          } else if (value instanceof File) {
            // Handle file attachments
            const buffer = await value.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            
            if (!emailData.attachments) {
              emailData.attachments = [];
            }
            emailData.attachments.push({
              filename: value.name,
              contentType: value.type,
              content: base64,
              size: value.size
            });
          }
        }
      } else {
        console.log(`[${requestId}] Processing JSON data`);
        emailData = await req.json();
      }

      console.log(`[${requestId}] Email data keys:`, Object.keys(emailData));
      
      // Generate tracking number
      const { data: trackingData, error: trackingError } = await supabase.rpc('get_next_tracking_number');
      
      if (trackingError) {
        console.error(`[${requestId}] Error generating tracking number:`, trackingError);
        throw trackingError;
      }

      const trackingNumber = `EMAIL-${trackingData}`;
      emailData.tracking_number = trackingNumber;

      console.log(`[${requestId}] Generated tracking number: ${trackingNumber}`);

      // Store communication log
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
            has_attachments: !!(emailData.attachments && emailData.attachments.length > 0)
          },
          status: 'received'
        });

      if (logError) {
        console.error(`[${requestId}] Error storing communication log:`, logError);
      }

      // Process the invoice
      console.log(`[${requestId}] Starting invoice processing`);
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
          .update({ status: 'failed', metadata: { error: invoiceError.message } })
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
            processed_successfully: true 
          }
        })
        .eq('tracking_number', trackingNumber);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Invoice processed successfully",
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
          requestId
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
