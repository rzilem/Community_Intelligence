/**
 * Helper functions for extracting invoice details from email content
 */

export function extractInvoiceDetails(content: string, subject: string): {
  invoice_number?: string;
  amount?: number;
  invoice_date?: string;
  due_date?: string;
  description?: string;
} {
  const result: {
    invoice_number?: string;
    amount?: number;
    invoice_date?: string;
    due_date?: string;
    description?: string;
  } = {};

  // Invoice number patterns - prioritize exact matches
  const invoiceNumberPatterns = [
    /\bInvoice\s*#?\s*(\d{3,7})\b/i,
    /\bInvoice Number[:\s]*(\d{3,7})\b/i,
    /\bInvoice[:\s]*#?\s*(\d{3,7})\b/i,
    /INVOICE[:\s-]*#?\s*(\d+)/i,
    /INVOICE[:\s-]*(\d+)/i,
    /Invoice Number[:\s]*(\d+)/i,
    /Invoice #[:\s]*(\d+)/i,
    /invoice\s*(?:#|number|num|no)[:\s]*([a-zA-Z0-9\-_]+)/i,
    /invoice[:\s]+([a-zA-Z0-9\-_]+)/i,
    /#\s*([a-zA-Z0-9\-_]+)/i,
    /bill\s*(?:#|number|num|no)[:\s]*([a-zA-Z0-9\-_]+)/i,
    /inv[:\s]*([a-zA-Z0-9\-_]+)/i  // Added shorter version
  ];

  // First try to find invoice number in subject
  for (const pattern of invoiceNumberPatterns) {
    const match = subject.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.invoice_number = match[1].trim();
      break;
    }
  }

  // If not found in subject, try content
  if (!result.invoice_number) {
    for (const pattern of invoiceNumberPatterns) {
      const match = content.match(pattern);
      if (match && match[1] && match[1].trim()) {
        result.invoice_number = match[1].trim();
        break;
      }
    }
  }

  // Amount patterns - prioritize total amount due
  const amountPatterns = [
    /Total Amount Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Amount Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Total Current Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Invoice Total[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Total Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Balance Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /TOTAL\s+AMOUNT\s+DUE\s*[\$]?\s*([\d,]+\.?\d*)/i,
    /Total\s+Due\s*[\$]?\s*([\d,]+\.?\d*)/i,
    /Amount\s+Due\s*[\$]?\s*([\d,]+\.?\d*)/i,
    /Total\s+Current\s+Due\s*[\$]?\s*([\d,]+\.?\d*)/i,
    /(?:total|amount|sum|invoice amount|balance|due)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.?\d*)/i,
    /(?:USD|EUR|GBP)[:\s]*\s*([\d,]+\.?\d*)/i,
    /(?:[\d,]+\.?\d*)\s*(?:USD|EUR|GBP|dollars)/i,
    /amount[:\s]*(?:USD|EUR|GBP)?\s*([\d,]+\.?\d*)/i
  ];

  // Extract amount using the new patterns
  for (const pattern of amountPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      // Remove commas and convert to number
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount)) {
        result.amount = amount;
        break;
      }
    }
  }

  // Due date patterns - improved to handle various formats
  const dueDatePatterns = [
    /Due Date[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Payment Due[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due By[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Pay By[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due\s+Date[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /due\s+date[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /payment\s+due[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /due\s+by[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /pay\s+by[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /payment\s+date[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i
  ];

  // Extract due date using the new patterns
  for (const pattern of dueDatePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      try {
        const dateStr = match[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          result.due_date = date.toISOString().split('T')[0];
          break;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }

  // Association name patterns
  const associationPatterns = [
    /Association Name[:\s]*([^\n<]+)/i,
    /Community Name[:\s]*([^\n<]+)/i,
    /HOA Name[:\s]*([^\n<]+)/i,
    /Property Name[:\s]*([^\n<]+)/i
  ];

  // Extract association name
  for (const pattern of associationPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.description = match[1].trim();
      break;
    }
  }

  return result;
}
