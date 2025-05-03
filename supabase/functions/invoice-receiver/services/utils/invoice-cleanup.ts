
import { Invoice } from "../../types/invoice-types.ts"; // Updated import path

export function cleanupInvoiceData(
  invoice: Record<string, any>,
  processedAttachment: any,
  subject: string,
  content: string
): Invoice {
  // Add document info to description
  if (invoice.description) {
    invoice.description += `\n\nExtracted from document: ${processedAttachment?.filename || 'email content'}`;
  } else {
    invoice.description = `Extracted from document: ${processedAttachment?.filename || 'email content'}`;
  }

  // Default values for required fields
  if (!invoice.invoice_number) {
    invoice.invoice_number = `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }
  
  if (!invoice.vendor) {
    const emailDomain = invoice.from?.match(/@([^.]+)\./);
    invoice.vendor = emailDomain?.[1] 
      ? emailDomain[1].charAt(0).toUpperCase() + emailDomain[1].slice(1)
      : "Unknown Vendor";
  }
  
  // Add subject and excerpt to description
  if (subject) {
    invoice.description = `Subject: ${subject}\n\n${invoice.description || ''}`;
    
    if (content && !invoice.description?.includes('Content:')) {
      invoice.description += `\nContent: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`;
    }
  }
  
  // Set default dates
  if (!invoice.invoice_date) {
    invoice.invoice_date = new Date().toISOString().split('T')[0];
  }
  
  if (!invoice.due_date) {
    const dueDate = new Date(invoice.invoice_date);
    dueDate.setDate(dueDate.getDate() + 30);
    invoice.due_date = dueDate.toISOString().split('T')[0];
  }

  // Set default amount
  if (!invoice.amount) {
    invoice.amount = 0;
    console.log("No amount could be extracted, setting default value of 0");
    
    if (invoice.description) {
      invoice.description += "\n\nNOTE: Amount could not be automatically extracted. Please update manually.";
    } else {
      invoice.description = "NOTE: Amount could not be automatically extracted. Please update manually.";
    }
  }
  
  console.log("Extracted invoice data:", invoice);
  return invoice as Invoice;
}
