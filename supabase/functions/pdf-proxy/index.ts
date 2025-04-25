
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const url = new URL(req.url);
    const pdfUrl = url.searchParams.get("url");

    if (!pdfUrl) {
      return new Response(
        JSON.stringify({ error: "Missing PDF URL parameter" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Fetching PDF from:', pdfUrl);
    
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch PDF:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: `Failed to fetch PDF: ${response.statusText}` }), 
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pdfBlob = await response.blob();
    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", "inline");
    headers.set("Cache-Control", "public, max-age=3600");

    return new Response(pdfBlob, { headers });
  } catch (error) {
    console.error('PDF proxy error:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error processing PDF" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
