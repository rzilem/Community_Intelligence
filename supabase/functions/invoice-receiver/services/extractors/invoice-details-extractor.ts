
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
  
  // Extract invoice number
  const invoiceNumberPatterns = [
    /invoice\s*(?:#|number|num|no)[:\s]*([a-zA-Z0-9\-_]+)/i,
    /invoice[:\s]+([a-zA-Z0-9\-_]+)/i,
    /#\s*([a-zA-Z0-9\-_]+)/i,
    /bill\s*(?:#|number|num|no)[:\s]*([a-zA-Z0-9\-_]+)/i
  ];
  
  // Check subject first for invoice number
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
  
  // Extract amount
  const amountPatterns = [
    /(?:total|amount|sum)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.?\d*)/i,
    /invoice\s+amount[:\s]*\$?\s*([\d,]+\.?\d*)/i
  ];
  
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

  // Extract invoice date
  const datePatterns = [
    /invoice\s+date[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /date[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /issued(?:\s+on)?[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i
  ];
  
  for (const pattern of datePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      try {
        // Try to parse the date
        const dateStr = match[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          result.invoice_date = date.toISOString().split('T')[0]; // format as YYYY-MM-DD
          break;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }
  
  // Extract due date
  const dueDatePatterns = [
    /due\s+date[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /payment\s+due[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /due\s+by[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i
  ];
  
  for (const pattern of dueDatePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      try {
        // Try to parse the date
        const dateStr = match[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          result.due_date = date.toISOString().split('T')[0]; // format as YYYY-MM-DD
          break;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }
  
  // Extract description/memo
  const descriptionPatterns = [
    /description[:\s]+([^\n<]+)/i,
    /memo[:\s]+([^\n<]+)/i,
    /regarding[:\s]+([^\n<]+)/i,
    /for[:\s]+([^\n<]+)/i
  ];
  
  for (const pattern of descriptionPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.description = match[1].trim();
      break;
    }
  }
  
  return result;
}
