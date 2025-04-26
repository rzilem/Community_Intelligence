
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getNextTrackingNumber, registerCommunication } from "./tracking-service.ts";

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
  
  try {
    // Generate a tracking number for this invoice
    const trackingNumber = await getNextTrackingNumber();
    
    // Add tracking number to invoice data
    const invoiceWithTracking = {
      ...invoiceData,
      tracking_number: trackingNumber
    };
    
    // Ensure invoice has an invoice number
    if (!invoiceWithTracking.invoice_number || invoiceWithTracking.invoice_number.trim() === '') {
      invoiceWithTracking.invoice_number = `INV-${Date.now().toString().slice(-6)}`;
    }

    // Ensure invoice has minimum required fields
    if (!invoiceWithTracking.status) {
      invoiceWithTracking.status = 'pending';
    }

    if (!invoiceWithTracking.due_date) {
      // Set default due date to 30 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      invoiceWithTracking.due_date = dueDate.toISOString().split('T')[0];
    }

    if (!invoiceWithTracking.invoice_date) {
      invoiceWithTracking.invoice_date = new Date().toISOString().split('T')[0];
    }
    
    // Log the invoice data being saved
    console.log("Creating invoice with data:", {
      tracking_number: trackingNumber,
      invoice_number: invoiceWithTracking.invoice_number,
      vendor: invoiceWithTracking.vendor,
      amount: invoiceWithTracking.amount,
      due_date: invoiceWithTracking.due_date,
      status: invoiceWithTracking.status,
      source_document: invoiceWithTracking.source_document || 'None'
    });
    
    // Insert the invoice into the database
    const { data, error } = await supabase
      .from("invoices")
      .insert(invoiceWithTracking)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating invoice in database:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    // Register this communication in the log
    await registerCommunication(trackingNumber, 'invoice', {
      invoice_id: data.id,
      vendor: data.vendor,
      amount: data.amount,
      invoice_number: data.invoice_number
    });
    
    console.log(`Invoice created successfully with ID: ${data.id} and tracking number: ${trackingNumber}`);
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
