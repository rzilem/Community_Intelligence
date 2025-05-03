
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { handleInvoiceEmail } from "./handlers/email-handler.ts";

console.log("Starting invoice-receiver initialization");

try {
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase client initialized");
  console.log("Function setup complete, starting server");

  // Start the server
  serve(async (req) => {
    return handleInvoiceEmail(req, supabase);
  });
} catch (initError) {
  console.error("Initialization failed:", initError.message);
  throw new Error(`Function failed to start: ${initError.message}`);
}
