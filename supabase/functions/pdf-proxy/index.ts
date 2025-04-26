
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pdfPath = url.searchParams.get('pdf');
    
    if (!pdfPath) {
      throw new Error("No PDF path provided");
    }

    console.log(`Attempting to proxy PDF at path: ${pdfPath}`);
    
    // Create Supabase client using service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the file from storage
    const { data, error } = await supabase.storage
      .from('invoices')
      .download(pdfPath);
      
    if (error || !data) {
      console.error("Error downloading file:", error);
      throw error || new Error("Unknown error while downloading file");
    }

    // Return the file with proper MIME type
    return new Response(data, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pdfPath.split('/').pop()}"`,
        // Cache control - caching allowed but must revalidate
        "Cache-Control": "public, must-revalidate, max-age=0"
      }
    });
  } catch (error) {
    console.error("Error in PDF proxy function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
