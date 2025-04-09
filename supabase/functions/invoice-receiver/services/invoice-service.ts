
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function createInvoice(invoiceData: any) {
  if (!invoiceData) {
    throw new Error("No invoice data provided");
  }
  
  try {
    // Insert the invoice into the database
    const { data, error } = await supabase
      .from("invoices")
      .insert(invoiceData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating invoice in database:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error in createInvoice:", error);
    throw error;
  }
}

export async function getInvoiceById(id: string) {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      console.error("Error fetching invoice:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error in getInvoiceById:", error);
    throw error;
  }
}
