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
  
  // Extract invoice number - improved patterns for more specific matches
  const invoiceNumberPatterns = [
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
  
  // Extract amount - look specifically for total amount due
  const amountPatterns = [
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
  
  // If no amount found yet, try to find a number with currency symbol
  if (!result.amount) {
    // Look for patterns like "$100.00" or "€50"
    const currencyPattern = /[\$\€\£\¥]\s*([\d,]+\.?\d*)/g;
    let match;
    let highestAmount = 0;
    
    // Find the highest amount with a currency symbol
    while ((match = currencyPattern.exec(content)) !== null) {
      if (match && match[1]) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > highestAmount) {
          highestAmount = amount;
        }
      }
    }
    
    if (highestAmount > 0) {
      result.amount = highestAmount;
    }
  }

  // Extract invoice date - improved date patterns
  const datePatterns = [
    /invoice\s+date[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /date[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /issued(?:\s+on)?[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /invoice\s+date[:\s]*(\d{4}-\d{2}-\d{2})/i, // ISO format dates
    /dated?[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i
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
  
  // Extract due date - improved patterns
  const dueDatePatterns = [
    /Due\s+Date[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /due\s+date[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /payment\s+due[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /due\s+by[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /pay\s+by[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /payment\s+date[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i
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
    /for[:\s]+([^\n<]+)/i,
    /details[:\s]+([^\n<]+)/i,
    /service[:\s]+([^\n<]+)/i
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
