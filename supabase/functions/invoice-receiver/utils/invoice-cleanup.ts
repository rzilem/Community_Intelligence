
/**
 * This module contains functions for cleaning up and validating invoice data
 */

export function cleanupInvoiceData(invoice: any, processedAttachment: any, subject: string, content: string) {
  console.log("Cleaning up invoice data");
  
  // Create a copy to avoid modifying the original
  const cleanedInvoice = { ...invoice };
  
  // If no invoice number, try to extract from other sources or generate one
  if (!cleanedInvoice.invoice_number) {
    console.log("No invoice number found, using fallback methods");
    
    // Try to extract from subject
    const subjectMatch = subject.match(/inv[^\d]*(\d+)/i) || subject.match(/invoice[^\d]*(\d+)/i);
    if (subjectMatch && subjectMatch[1]) {
      cleanedInvoice.invoice_number = subjectMatch[1];
    } else {
      // Generate a default invoice number using timestamp
      cleanedInvoice.invoice_number = `INV-${Date.now().toString().slice(-7)}`;
    }
  }
  
  // If amount is missing, set to 0 and flag for manual update
  if (!cleanedInvoice.amount) {
    console.log("No amount could be extracted, setting default value of 0");
    cleanedInvoice.amount = 0;
    
    // Add note to description field
    const existingDesc = cleanedInvoice.description || "";
    cleanedInvoice.description = existingDesc + 
      (existingDesc ? '\n\n' : '') + 
      `Extracted from ${processedAttachment?.filename || 'email'}\n\nNOTE: Amount could not be automatically extracted. Please update manually.`;
  }
  
  // If no vendor specified, set a placeholder
  if (!cleanedInvoice.vendor) {
    console.log("No vendor could be extracted, setting default");
    cleanedInvoice.vendor = "Unknown Vendor";
  }
  
  // Set default dates if not available
  if (!cleanedInvoice.invoice_date) {
    console.log("No invoice date found, using today's date");
    cleanedInvoice.invoice_date = new Date().toISOString().split('T')[0];
  }
  
  if (!cleanedInvoice.due_date) {
    console.log("No due date found, setting to 30 days from now");
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    cleanedInvoice.due_date = dueDate.toISOString().split('T')[0];
  }
  
  // Validate numeric fields
  if (typeof cleanedInvoice.amount !== 'number') {
    const parsedAmount = parseFloat(cleanedInvoice.amount);
    cleanedInvoice.amount = isNaN(parsedAmount) ? 0 : parsedAmount;
  }
  
  // Ensure status is valid
  if (!['pending', 'approved', 'rejected', 'paid'].includes(cleanedInvoice.status)) {
    cleanedInvoice.status = 'pending';
  }
  
  return cleanedInvoice;
}
