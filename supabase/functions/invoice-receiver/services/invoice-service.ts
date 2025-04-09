
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function createInvoice(invoiceData: any) {
  if (!invoiceData) {
    const error = new Error("No invoice data provided");
    console.error("Error in createInvoice:", error);
    throw error;
  }
  
  // Log the invoice data being saved
  console.log("Creating invoice with data:", {
    invoice_number: invoiceData.invoice_number,
    vendor: invoiceData.vendor,
    amount: invoiceData.amount,
    due_date: invoiceData.due_date,
    status: invoiceData.status,
    source_document: invoiceData.source_document || 'None'
  });
  
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
    
    console.log("Invoice created successfully with ID:", data.id);
    return data;
  } catch (error) {
    console.error("Error in createInvoice:", error);
    throw error;
  }
}

export async function getInvoiceById(id: string) {
  if (!id) {
    const error = new Error("No invoice ID provided");
    console.error("Error in getInvoiceById:", error);
    throw error;
  }

  console.log(`Fetching invoice by ID: ${id}`);
  
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
    
    console.log("Invoice fetched successfully:", data?.invoice_number);
    return data;
  } catch (error) {
    console.error("Error in getInvoiceById:", error);
    throw error;
  }
}

export async function updateInvoiceStatus(id: string, status: string) {
  if (!id) {
    const error = new Error("No invoice ID provided");
    console.error("Error in updateInvoiceStatus:", error);
    throw error;
  }

  console.log(`Updating invoice ${id} status to: ${status}`);
  
  try {
    const { data, error } = await supabase
      .from("invoices")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating invoice status:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log("Invoice status updated successfully");
    return data;
  } catch (error) {
    console.error("Error in updateInvoiceStatus:", error);
    throw error;
  }
}
