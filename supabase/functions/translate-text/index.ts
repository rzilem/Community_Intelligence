
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage } = await req.json();

    if (!text) {
      throw new Error("No text provided for translation");
    }

    if (!targetLanguage) {
      throw new Error("No target language provided");
    }

    console.log(`Translating text to ${targetLanguage}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

    // Get API key from environment variables
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Call OpenAI API for translation
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a translation assistant. Translate the user's input text to ${targetLanguage}. Preserve formatting and give only the translated text without explanations.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response from OpenAI API");
    }
    
    const translatedText = data.choices[0].message.content;
    
    console.log(`Translation successful: "${translatedText.substring(0, 50)}${translatedText.length > 50 ? '...' : ''}"`);

    return new Response(
      JSON.stringify({
        translatedText,
        sourceLanguage: "auto-detect",
        targetLanguage
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
