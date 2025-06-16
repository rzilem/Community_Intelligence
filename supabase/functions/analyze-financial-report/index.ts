
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractTextFromPdf } from "./utils/pdf-extractor.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return new Response(
        JSON.stringify({ success: false, error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { fileUrl, associationId } = await req.json();

    if (!fileUrl || !associationId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(
      `Processing financial report for association ${associationId}: ${fileUrl}`,
    );

    const fileResp = await fetch(fileUrl);
    if (!fileResp.ok) {
      throw new Error(`Failed to download PDF: ${fileResp.status}`);
    }
    const arrayBuffer = await fileResp.arrayBuffer();
    const base64Pdf = `data:application/pdf;base64,${arrayBufferToBase64(arrayBuffer)}`;

    const extractedText = await extractTextFromPdf(base64Pdf);
    if (!extractedText) {
      throw new Error("Failed to extract text from PDF");
    }

    const systemPrompt = `You are an expert HOA accountant. Analyze the provided financial report text and return JSON with the following structure:\n{\n  "sourceGLCodes": [{"code": "string", "name": "string", "balance": number}],\n  "suggestedMappings": [{"source": {"code": "string", "name": "string"}, "target": {"code": "string", "name": "string"}, "confidence": number}],\n  "unrecognizedCodes": [{"code": "string", "name": "string", "balance": number}],\n  "analysisMetadata": {"associationId": "string", "documentName": "string", "timestamp": "ISODate"}\n}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: extractedText.substring(0, 15000) },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`OpenAI API error (${aiRes.status}): ${errText}`);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices[0].message.content as string;
    let result: Record<string, unknown> | null = null;
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      }
    } catch (parseErr) {
      throw new Error(`Failed to parse AI response: ${parseErr.message}`);
    }

    if (!result) {
      throw new Error("AI response did not contain valid JSON");
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-financial-report function:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
