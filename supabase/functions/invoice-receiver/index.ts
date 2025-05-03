
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { processMultipartFormData, normalizeEmailData } from "./utils/request-parser.ts";
import { processInvoiceEmail } from "./services/invoice-processor.ts";
import { createInvoice } from "./services/invoice-service.ts";
import { corsHeaders } from "./utils/cors-headers.ts";
import { Invoice } from "./services/invoice-types.ts";
import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

console.log("Starting invoice-receiver initialization");

try {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase client initialized");

  async function logToSupabase(requestId: string, level: string, message: string, metadata: any) {
    try {
      const { error } = await supabase.from('function_logs').insert({
        request_id: requestId,
        function_name: 'invoice-receiver',
        timestamp: new Date().toISOString(),
        level,
        message,
        metadata
      });
      if (error) {
        console.error(`Failed to store log: ${error.message}`);
      }
    } catch (logError) {
      console.error(`Error logging to Supabase: ${logError.message}`);
    }
  }

  console.log("Function setup complete, starting server");

  serve(async (req) => {
    const requestId = `req_${Date.now()}`;
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      console.log(`[${requestId}] Received invoice email`, {
        contentType: req.headers.get("content-type"),
        headers: Object.fromEntries([...req.headers.entries()])
      });
      await logToSupabase(requestId, 'info', 'Received invoice email', {
        contentType: req.headers.get("content-type"),
        headers: Object.fromEntries([...req.headers.entries()])
      });

      const reqCopy = req.clone();
      try {
        const rawText = await reqCopy.text();
        console.log(`[${requestId}] Raw request body length: ${rawText.length} characters`);
        await logToSupabase(requestId, 'info', 'Raw request body', {
          length: rawText.length,
          snippet: rawText.length < 1000 ? rawText : rawText.substring(0, 1000) + "..."
        });
      } catch (e) {
        console.log(`[${requestId}] Could not read raw request body: ${e.message}`);
      }

      let emailData;
      try {
        emailData = await processMultipartFormData(req);
        console.log(`[${requestId}] Successfully processed form data`);
        await logToSupabase(requestId, 'info', 'Processed form data', { keys: Object.keys(emailData) });
      } catch (parseError) {
        console.error(`[${requestId}] Error parsing request body: ${parseError.message}`);
        await logToSupabase(requestId, 'error', 'Error parsing request body', { error: parseError.message });
        try {
          const jsonReqCopy = req.clone();
          emailData = await jsonReqCopy.json();
          console.log(`[${requestId}] Successfully parsed as JSON fallback`);
        } catch (jsonError) {
          console.error(`[${requestId}] Error parsing request as JSON: ${jsonError.message}`);
          await logToSupabase(requestId, 'error', 'Error parsing request as JSON', { error: jsonError.message });
          return new Response(JSON.stringify({
            success: false,
            error: "Invalid request format",
            details: `${parseError.message}, then ${jsonError.message}`,
            headers: Object.fromEntries([...req.headers.entries()])
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400
          });
        }
      }

      if (!emailData || (typeof emailData === 'object' && Object.keys(emailData).length === 0)) {
        console.error(`[${requestId}] Empty email data received`);
        await logToSupabase(requestId, 'error', 'Empty email data received', {});
        return new Response(JSON.stringify({
          success: false,
          error: "Empty email data",
          details: "The email webhook payload was empty or invalid",
          headers: Object.fromEntries([...req.headers.entries()])
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        });
      }

      const normalizedEmailData = normalizeEmailData(emailData);
      console.log(`[${requestId}] Normalized invoice email data`, {
        from: normalizedEmailData.from,
        to: normalizedEmailData.to,
        subject: normalizedEmailData.subject,
        hasHtml: !!normalizedEmailData.html,
        hasText: !!normalizedEmailData.text,
        attachmentsCount: normalizedEmailData.attachments?.length,
        attachmentSummary: normalizedEmailData.attachments?.map(a => ({
          name: a.filename,
          type: a.contentType,
          hasContent: !!a.content,
          contentLength: typeof a.content === 'string' ? a.content.length : a.content instanceof Blob ? a.content.size : 'unknown',
          contentType: typeof a.content
        }))
      });
      await logToSupabase(requestId, 'info', 'Normalized invoice email data', {
        from: normalizedEmailData.from,
        subject: normalizedEmailData.subject,
        attachmentsCount: normalizedEmailData.attachments?.length
      });

      if (!normalizedEmailData.html && !normalizedEmailData.text && !normalizedEmailData.subject) {
        console.error(`[${requestId}] Email missing required content`);
        await logToSupabase(requestId, 'error', 'Email missing required content', {});
        return new Response(JSON.stringify({
          success: false,
          error: "Missing required content",
          details: "Email must contain HTML, text content, or at least a subject"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 422
        });
      }

      let pdfUrl: string | null = null;
      if (normalizedEmailData.attachments && normalizedEmailData.attachments.length > 0) {
        console.log(`[${requestId}] Processing attachments: ${normalizedEmailData.attachments.length}`);
        await logToSupabase(requestId, 'info', 'Processing attachments', { count: normalizedEmailData.attachments.length });

        const attachment = normalizedEmailData.attachments.find(att =>
          att.contentType.includes('pdf') || att.contentType.includes('word') || att.contentType.includes('doc')
        );

        if (attachment) {
          console.log(`[${requestId}] Found document attachment: ${attachment.filename}`);
          await logToSupabase(requestId, 'info', 'Found document attachment', { filename: attachment.filename });

          const fileExt = attachment.filename.substring(attachment.filename.lastIndexOf('.'));
          const timestamp = new Date().toISOString().replace(/[:.]/g, '');
          const fileName = `invoice_${timestamp}${fileExt}`;
          const normalizedFileName = fileName.replace(/\/+/g, '');

          try {
            let content: Uint8Array;
            if (typeof attachment.content === 'string') {
              const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(attachment.content.trim());
              if (!isBase64) {
                throw new Error(`Attachment content for ${attachment.filename} is not base64 encoded`);
              }
              const base64Content = attachment.content
                .replace(/^data:application\/pdf;base64,/, '')
                .replace(/\s/g, '');
              content = decode(base64Content);
            } else if (attachment.content instanceof Blob) {
              content = new Uint8Array(await attachment.content.arrayBuffer());
            } else {
              content = attachment.content;
            }

            if (attachment.contentType === 'application/pdf') {
              const pdfHeader = Array.from(content.slice(0, 4)).map(b => b.toString(16)).join('');
              if (pdfHeader !== '25504446') {
                throw new Error(`Invalid PDF header for ${attachment.filename}: ${pdfHeader}`);
              }
            }

            const { error: uploadError } = await supabase.storage
              .from('invoices')
              .upload(normalizedFileName, content, {
                contentType: attachment.contentType,
                upsert: true
              });

            if (uploadError) {
              console.error(`[${requestId}] Error uploading attachment: ${uploadError.message}`);
              await logToSupabase(requestId, 'error', 'Error uploading attachment', { error: uploadError.message });
            } else {
              const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(normalizedFileName);
              pdfUrl = urlData.publicUrl;
              pdfUrl = pdfUrl.replace(/([^:])\/\/+/g, '$1/');
              console.log(`[${requestId}] Attachment uploaded successfully: ${pdfUrl}`);
              await logToSupabase(requestId, 'info', 'Attachment uploaded successfully', { pdfUrl });

              try {
                const response = await fetch(pdfUrl, { method: 'GET' });
                if (!response.ok) {
                  throw new Error(`Failed to fetch uploaded file: ${response.status}`);
                }
                const uploadedBuffer = new Uint8Array(await response.arrayBuffer());
                const uploadedHeader = Array.from(uploadedBuffer.slice(0, 4)).map(b => b.toString(16)).join('');
                if (attachment.contentType === 'application/pdf' && uploadedHeader !== '25504446') {
                  console.error(`Uploaded file corrupted: ${pdfUrl}`, { uploadedHeader });
                  await supabase.storage.from('invoices').remove([normalizedFileName]);
                  throw new Error(`Uploaded file is not a valid PDF`);
                }
                if (uploadedBuffer.byteLength !== content.byteLength) {
                  console.error(`Uploaded file size mismatch: ${pdfUrl}`, {
                    originalSize: content.byteLength,
                    uploadedSize: uploadedBuffer.byteLength
                  });
                  await supabase.storage.from('invoices').remove([normalizedFileName]);
                  throw new Error(`Uploaded file size does not match original`);
                }
              } catch (validationError) {
                console.error(`[${requestId}] Error validating uploaded file: ${validationError.message}`);
                await logToSupabase(requestId, 'error', 'Error validating uploaded file', { error: validationError.message });
                pdfUrl = null;
              }
            }
          } catch (storageError) {
            console.error(`[${requestId}] Storage error: ${storageError.message}`);
            await logToSupabase(requestId, 'error', 'Storage error', { error: storageError.message });
          }
        }
      }

      console.log(`[${requestId}] Processing invoice email to extract data`);
      const invoiceData = await processInvoiceEmail(normalizedEmailData);
      console.log(`[${requestId}] Extracted invoice data`, JSON.stringify(invoiceData, null, 2));
      await logToSupabase(requestId, 'info', 'Extracted invoice data', {
        invoiceNumber: invoiceData.invoice_number,
        vendor: invoiceData.vendor,
        pdfUrl: invoiceData.pdf_url
      });

      try {
        if (pdfUrl) {
          invoiceData.pdf_url = pdfUrl;
        }
        const invoice = await createInvoice(invoiceData);
        console.log(`[${requestId}] Invoice created successfully`, {
          id: invoice.id,
          vendor: invoice.vendor,
          amount: invoice.amount,
          pdf_url: invoice.pdf_url || 'none',
          html_content: invoice.html_content ? 'present' : 'none'
        });
        await logToSupabase(requestId, 'info', 'Invoice created successfully', {
          id: invoice.id,
          trackingNumber: invoice.tracking_number
        });

        if (!invoiceData.vendor || invoiceData.vendor === "Unknown Vendor" || !invoiceData.amount || invoiceData.amount === 0) {
          return new Response(JSON.stringify({
            success: true,
            warning: "Invoice created with partial data",
            message: "Invoice was created but may need manual review",
            invoice
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 201
          });
        }

        return new Response(JSON.stringify({
          success: true,
          message: "Invoice created",
          invoice
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201
        });
      } catch (dbError) {
        console.error(`[${requestId}] Database error creating invoice: ${dbError.message}`);
        await logToSupabase(requestId, 'error', 'Database error creating invoice', {
          error: dbError.message,
          extractedData: invoiceData
        });
        return new Response(JSON.stringify({
          success: false,
          error: "Database error",
          details: dbError.message,
          extracted_data: invoiceData
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        });
      }
    } catch (error) {
      console.error(`[${requestId}] Error handling invoice email: ${error.message}`);
      await logToSupabase(requestId, 'error', 'Error handling invoice email', { error: error.message });
      return new Response(JSON.stringify({
        success: false,
        error: "Processing error",
        details: error.message
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      });
    }
  });
} catch (initError) {
  console.error("Initialization failed:", initError.message);
  throw new Error(`Function failed to start: ${initError.message}`);
}
