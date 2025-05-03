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

  const invoiceNumberPatterns = [
    /Invoice(?:\s*Number|\s*#|\s*No)?[:.\s]*(\d{3,4})\b/i,
    /Invoice[:\s]*#?\s*(\d{3,4})\b/i,
    /\bInv(?:oice)?\s*#?\s*(\d{3,4})\b/i,
    /\bInvoice\s*(?:#|No|Number)?\s*[:=]?\s*(\d{3,7})\b/i,
    /\bInvoice\s+(\d{3,7})\b/i,
    /INVOICE[:\s-]*#?\s*(\d+)/i,
    /INVOICE[:\s-]*(\d+)/i,
    /Invoice Number[:\s]*(\d+)/i,
    /Invoice #[:\s]*(\d+)/i,
    /invoice\s*(?:#|number|num|no)[:\s]*([a-zA-Z0-9\-_]+)/i,
    /invoice[:\s]+([a-zA-Z0-9\-_]+)/i,
    /#\s*([a-zA-Z0-9\-_]+)/i,
    /bill\s*(?:#|number|num|no)[:\s]*([a-zA-Z0-9\-_]+)/i,
    /inv[:\s]*([a-zA-Z0-9\-_]+)/i,
    /Invoice\s*:\s*(\d+)/i
  ];

  let foundInvoiceNumber = false;
  for (const pattern of invoiceNumberPatterns) {
    const subjectMatch = subject.match(pattern);
    const contentMatch = content.match(pattern);
    const match = subjectMatch || contentMatch;
    
    if (match && match[1] && match[1].trim()) {
      result.invoice_number = match[1].trim();
      foundInvoiceNumber = true;
      break;
    }
  }

  if (!foundInvoiceNumber) {
    result.invoice_number = '';
  }

  const amountPatterns = [
    /Total\s+Amount\s+Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Amount\s+Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Total[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.\d{2})/,
    /Total Amount Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /TOTAL\s+AMOUNT\s+DUE\s*[\$]?\s*([\d,]+\.?\d*)/i,
    /Amount Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Total Current Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Invoice Total[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Total Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Balance Due[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Total\s+Due\s*[\$]?\s*([\d,]+\.?\d*)/i,
    /Amount\s+Due\s*[\$]?\s*([\d,]+\.?\d*)/i,
    /Total\s+Current\s+Due\s*[\$]?\s*([\d,]+\.?\d*)/i,
    /Total\s*:\s*\$?\s*([\d,]+\.?\d*)/i,
    /(?:total|amount|sum|invoice amount|balance|due)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.?\d*)/i,
    /(?:USD|EUR|GBP)[:\s]*\s*([\d,]+\.?\d*)/i,
    /(?:[\d,]+\.?\d*)\s*(?:USD|EUR|GBP|dollars)/i,
    /amount[:\s]*(?:USD|EUR|GBP)?\s*([\d,]+\.?\d*)/i
  ];

  for (const pattern of amountPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount)) {
        result.amount = parseFloat(amount.toFixed(2));
        break;
      }
    }
  }

  const dueDatePatterns = [
    /Due\s+Date[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due\s+Date[:\s]*(\d{1,2}-\d{1,2}-\d{2,4})/i,
    /Due\s+By[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due Date[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due Date[:\s]*(\d{1,2}-\d{1,2}-\d{2,4})/i,
    /Due[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due[:\s]*(\d{1,2}-\d{1,2}-\d{2,4})/i,
    /Payment Due[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due By[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Pay By[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due\s+Date[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Due\s+Date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /Due\s+By[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
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
        const dateStr = match[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          result.due_date = date.toISOString().split('T')[0];
          break;
        }
      } catch (e) {}
    }
  }

  return result;
}
