import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getNextTrackingNumber, registerCommunication } from "./tracking-service.ts";
import { Invoice } from "../types/invoice-types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function createInvoice(invoiceData: Partial<Invoice>) {
  const requestId = invoiceData.tracking_number || `invoice_${Date.now()}`;
  if (!invoiceData) {
    console.error(`[${requestId}] No invoice data provided`);
    throw new Error("No invoice data provided");
  }

  try {
    const trackingNumber = await getNextTrackingNumber();
    const invoiceWithTracking: Partial<Invoice> = {
      ...invoiceData,
      tracking_number: trackingNumber,
      status: invoiceData.status || 'pending',
      due_date: invoiceData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
      invoice_number: invoiceData.invoice_number || `INV-${Date.now().toString().slice(-6)}`
    };

    const cleanedInvoice = Object.fromEntries(
      Object.entries(invoiceWithTracking).filter(([_, value]) => value !== undefined)
    );

    console.log(`[${requestId}] Creating invoice`, {
      tracking_number: trackingNumber,
      invoice_number: cleanedInvoice.invoice_number,
      vendor: cleanedInvoice.vendor,
      amount: cleanedInvoice.amount,
      due_date: cleanedInvoice.due_date,
      status: cleanedInvoice.status,
      source_document: cleanedInvoice.source_document || 'None',
      email_content: cleanedInvoice.email_content || 'None'
    });

    const { data, error } = await supabase
      .from("invoices")
      .insert(cleanedInvoice)
      .select()
      .single();

    if (error) {
      console.error(`[${requestId}] Error creating invoice in database: ${error.message}`);
      throw new Error(`Database error: ${error.message}`);
    }

    await registerCommunication(trackingNumber, 'invoice', {
      invoice_id: data.id,
      vendor: data.vendor,
      amount: data.amount,
      invoice_number: data.invoice_number
    });

    console.log(`[${requestId}] Invoice created successfully`, {
      id: data.id,
      tracking_number: trackingNumber
    });
    return data;
  } catch (error) {
    console.error(`[${requestId}] Error in createInvoice: ${error.message}`);
    throw error;
  }
}

export async function getInvoiceById(id: string) {
  if (!id) {
    console.error("No invoice ID provided");
    throw new Error("No invoice ID provided");
  }

  console.log(`Fetching invoice by ID: ${id}`);
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching invoice: ${error.message}`);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Invoice fetched successfully: ${data?.invoice_number}`);
    return data;
  } catch (error) {
    console.error(`Error in getInvoiceById: ${error.message}`);
    throw error;
  }
}

export async function updateInvoiceStatus(id: string, status: Invoice['status']) {
  if (!id) {
    console.error("No invoice ID provided");
    throw new Error("No invoice ID provided");
  }

  console.log(`Updating invoice ${id} status to: ${status}`);
  try {
    const { data, error } = await supabase
      .from("invoices")
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating invoice status: ${error.message}`);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Invoice status updated successfully: ${id}`);
    return data;
  } catch (error) {
    console.error(`Error in updateInvoiceStatus: ${error.message}`);
    throw error;
  }
}
