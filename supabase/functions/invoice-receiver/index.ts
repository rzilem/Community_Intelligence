
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Log configuration for debugging
console.log("Invoice Receiver Function Starting");
console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "Set" : "Missing");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method === "POST") {
    try {
      console.log("Processing invoice upload request");
      const formData = await req.formData();
      const file = formData.get("file"); // The PDF file from the request
      
      if (!file || !(file instanceof File)) {
        console.error("No valid file provided in request");
        throw new Error("No valid file provided");
      }

      const filename = file.name || `invoice_${Date.now()}.pdf`;
      console.log(`Processing file: ${filename}, size: ${file.size} bytes`);
      
      // Convert to binary data to prevent corruption
      const fileBuffer = await file.arrayBuffer();
      
      console.log(`Uploading ${filename} to 'invoices' bucket`);
      // Upload the PDF to the 'invoices' bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(filename, fileBuffer, { contentType: "application/pdf" });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return new Response(
          JSON.stringify({ error: "Failed to upload PDF", details: uploadError }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log("File uploaded successfully, generating public URL");
      // Generate a public URL (since the bucket is public)
      const { data: publicData } = supabase.storage
        .from("invoices")
        .getPublicUrl(filename);

      console.log("Public URL generated:", publicData.publicUrl);

      // Save the public URL and filename to the 'invoices' table
      const invoiceData = {
        pdf_url: publicData.publicUrl,
        source_document: filename,
      };

      console.log("Saving invoice data to database:", invoiceData);
      const { data: dbData, error: insertError } = await supabase.from("invoices").insert(invoiceData).select();
      
      if (insertError) {
        console.error("Database insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to save invoice data", details: insertError }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log("Invoice successfully processed and saved:", dbData);
      return new Response(
        JSON.stringify({ 
          success: true, 
          pdf_url: publicData.publicUrl,
          invoice_id: dbData?.[0]?.id 
        }), 
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error processing invoice:", error.message);
      return new Response(
        JSON.stringify({ error: "Internal server error", message: error.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
  
  return new Response(
    "Method not allowed", 
    { status: 405, headers: corsHeaders }
  );
});
