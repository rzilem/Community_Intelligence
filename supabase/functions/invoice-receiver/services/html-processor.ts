import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export async function processHtmlContent(documentContent: string, rawHtmlContent: string, rawTextContent: string, subject: string): Promise<string> {
  let parsedText = documentContent || rawTextContent;
  if (!documentContent && rawHtmlContent) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtmlContent, "text/html");
      if (doc && doc.body) {
        parsedText = doc.body.textContent || rawTextContent;
      }
    } catch (error) {
      console.error("Error parsing HTML:", error);
    }
  }
  return documentContent || parsedText || rawTextContent || subject;
}