import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { processMultipartFormData, normalizeEmailData } from "./utils/request-parser.ts";
import { processInvoiceEmail } from "./services/invoice-processor.ts";
import { createInvoice } from "./services/invoice-service.ts";
import { corsHeaders } from "./utils/cors-headers.ts";
import { processDocument } from "./services/document-processor.ts";

const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log("Received invoice email with content-type:", req.headers.get("content-type"));
    const emailData = await processMultipartFormData(req).catch(async () => await req.json());

    if (!emailData || (typeof emailData === 'object' && Object.keys(emailData).length === 0)) {
      return new Response(JSON.stringify({
        success: false,
        error: "Empty email data",
        details: "The email webhook payload was empty or invalid"
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }

    const normalizedEmailData = normalizeEmailData(emailData);
    console.log("Normalized invoice email data:", {
      from: normalizedEmailData.from,
      subject: normalizedEmailData.subject,
      attachmentsCount: normalizedEmailData.attachments?.length,
      attachmentDetails: normalizedEmailData.attachments?.map(a => ({
        filename: a.filename,
        contentType: a.contentType,
        contentLength: a.content instanceof Blob ? a.content.size : typeof a.content === 'string' ? a.content.length : 'unknown'
      }))
    });

    if (!normalizedEmailData.html && !normalizedEmailData.text && !normalizedEmailData.subject) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required content",
        details: "Email must contain HTML, text content, or at least a subject"
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 });
    }

    const { documentContent, processedAttachment } = await processDocument(normalizedEmailData.attachments);
    const invoiceData = await processInvoiceEmail(normalizedEmailData);

    if (processedAttachment) {
      invoiceData.pdf_url = processedAttachment.url;
      invoiceData.source_document = processedAttachment.source_document;
    }

    const invoice = await createInvoice(invoiceData);
    console.log("Invoice created successfully:", {
      id: invoice.id,
      vendor: invoice.vendor,
      pdf_url: invoice.pdf_url || 'none',
      source_document: invoice.source_document || 'none'
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Invoice created",
      invoice
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 201 });
  } catch (error) {
    console.error("Error handling invoice email:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Processing error",
      details: error.message
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
