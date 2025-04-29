import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === "POST") {
    try {
      const formData = await req.formData();
      const file = formData.get("file"); // The PDF file from the request
      if (!file || !(file instanceof File)) throw new Error("No valid file provided");

      const filename = file.name || `invoice_${Date.now()}.pdf`;
      const fileBuffer = await file.arrayBuffer(); // Convert to binary data

      // Upload the PDF to the 'invoices' bucket
      const { error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(filename, fileBuffer, { contentType: "application/pdf" });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return new Response(JSON.stringify({ error: "Failed to upload PDF" }), { status: 500 });
      }

      // Generate a public URL (since the bucket is public)
      const { data: publicData } = supabase.storage
        .from("invoices")
        .getPublicUrl(filename);

      // Save the public URL and filename to the 'invoices' table
      const invoiceData = {
        pdf_url: publicData.publicUrl,
        source_document: filename,
      };

      const { error: insertError } = await supabase.from("invoices").insert(invoiceData);
      if (insertError) {
        console.error("Database insert error:", insertError);
        return new Response(JSON.stringify({ error: "Failed to save invoice data" }), { status: 500 });
      }

      return new Response(JSON.stringify({ success: true, pdf_url: publicData.publicUrl }), { status: 201 });
    } catch (error) {
      console.error("Error processing invoice:", error.message);
      return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
  }
  return new Response("Method not allowed", { status: 405 });
});
