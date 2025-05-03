
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { log } from "../utils/logging.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate a tracking number for the invoice
async function generateTrackingNumber(): Promise<string> {
  try {
    const { data } = await supabase.rpc('get_next_tracking_number');
    const trackingNumber = `INV-${String(data).padStart(6, '0')}`;
    console.log("Generated new tracking number:", trackingNumber);
    return trackingNumber;
  } catch (error) {
    console.log("Error generating tracking number, using fallback:", error);
    // Fallback to timestamp-based tracking number
    return `INV-${Date.now().toString().slice(-6)}`;
  }
}

export async function createInvoice(invoiceData: any) {
  try {
    const trackingNumber = await generateTrackingNumber();

    // Check if we have required fields
    if (!invoiceData.invoice_number) {
      invoiceData.invoice_number = `INV-${Date.now().toString().slice(-8)}`;
    }

    // Create the invoice object with safe defaults
    const invoiceToCreate = {
      tracking_number: trackingNumber,
      invoice_number: invoiceData.invoice_number,
      vendor: invoiceData.vendor || "Unknown Vendor",
      amount: invoiceData.amount || 0,
      invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
      due_date: invoiceData.due_date || null,
      description: invoiceData.description || null,
      association_id: invoiceData.association_id || null,
      status: invoiceData.status || 'pending',
      pdf_url: invoiceData.pdf_url || null,
      html_content: invoiceData.html_content || null,
      source_document: invoiceData.source_document || "None"
      // Remove email_content field that's causing issues
    };

    console.log("Creating invoice with data:", invoiceToCreate);

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceToCreate)
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
