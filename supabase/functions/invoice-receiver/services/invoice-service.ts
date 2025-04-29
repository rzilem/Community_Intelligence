
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getNextTrackingNumber, registerCommunication } from "./tracking-service.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function createInvoice(invoiceData) {
  if (!invoiceData) {
    const error = new Error("No invoice data provided");
    console.error("Error in createInvoice:", error);
    throw error;
  }

  try {
    const trackingNumber = await getNextTrackingNumber();
    const invoiceWithTracking = {
      ...invoiceData,
      tracking_number: trackingNumber
    };

    if (!invoiceWithTracking.invoice_number || invoiceWithTracking.invoice_number.trim() === '') {
      invoiceWithTracking.invoice_number = `INV-${Date.now().toString().slice(-6)}`;
    }
    if (!invoiceWithTracking.status) {
      invoiceWithTracking.status = 'pending';
    }
    if (!invoiceWithTracking.due_date) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      invoiceWithTracking.due_date = dueDate.toISOString().split('T')[0];
    }
    if (!invoiceWithTracking.invoice_date) {
      invoiceWithTracking.invoice_date = new Date().toISOString().split('T')[0];
    }

    // Store both the signed URL (pdf_url) and the source document name
    console.log("Creating invoice with data:", {
      tracking_number: trackingNumber,
      invoice_number: invoiceWithTracking.invoice_number,
      vendor: invoiceWithTracking.vendor,
      amount: invoiceWithTracking.amount,
      due_date: invoiceWithTracking.due_date,
      status: invoiceWithTracking.status,
      source_document: invoiceWithTracking.source_document || 'None',
      pdf_url: invoiceWithTracking.pdf_url || 'None'
    });

    // Remove association_type if it's not in the database schema
    if (invoiceWithTracking.association_type !== undefined) {
      delete invoiceWithTracking.association_type;
    }

    const { data, error } = await supabase.from("invoices").insert(invoiceWithTracking).select().single();
    if (error) {
      console.error("Error creating invoice in database:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    await registerCommunication(trackingNumber, 'invoice', {
      invoice_id: data.id,
      vendor: data.vendor,
      amount: data.amount,
      invoice_number: data.invoice_number,
      pdf_url: data.pdf_url
    });

    console.log(`Invoice created successfully with ID: ${data.id} and tracking number: ${trackingNumber}`);
    return data;
  } catch (error) {
    console.error("Error in createInvoice:", error);
    throw error;
  }
}
