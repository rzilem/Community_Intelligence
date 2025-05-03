
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

  console.log("Extracting invoice details from content and subject:", { 
    contentLength: content?.length || 0,
    subject: subject || 'none'
  });

  // First try to extract invoice number
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
    /Invoice\s*:\s*(\d+)/i,
    /Reference[:\s]*#?\s*([a-zA-Z0-9\-_]+)/i,
    /Order\s*(?:#|No|Number)?[:\s]*([a-zA-Z0-9\-_]+)/i
  ];

  let foundInvoiceNumber = false;
  // Try subject first as it often contains the invoice number
  if (subject) {
    for (const pattern of invoiceNumberPatterns) {
      const match = subject.match(pattern);
      if (match && match[1] && match[1].trim()) {
        result.invoice_number = match[1].trim();
        console.log(`Extracted invoice number from subject: ${result.invoice_number}`);
        foundInvoiceNumber = true;
        break;
      }
    }
  }

  // If not found in subject, try content
  if (!foundInvoiceNumber) {
    for (const pattern of invoiceNumberPatterns) {
      const match = content.match(pattern);
      if (match && match[1] && match[1].trim()) {
        result.invoice_number = match[1].trim();
        console.log(`Extracted invoice number from content: ${result.invoice_number}`);
        foundInvoiceNumber = true;
        break;
      }
    }
  }

  if (!foundInvoiceNumber) {
    console.log("No invoice number found, generating one");
    result.invoice_number = `INV-${Date.now().toString().slice(-6)}`;
  }

  // Extract amount
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
    /amount[:\s]*(?:USD|EUR|GBP)?\s*([\d,]+\.?\d*)/i,
    /grand total[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /subtotal[:\s]*\$?\s*([\d,]+\.?\d*)/i
  ];

  let foundAmount = false;
  for (const pattern of amountPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount)) {
        result.amount = parseFloat(amount.toFixed(2));
        console.log(`Extracted amount: $${result.amount}`);
        foundAmount = true;
        break;
      }
    }
  }

  if (!foundAmount) {
    console.log("No amount found");
  }

  // Extract due date
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

  let foundDueDate = false;
  for (const pattern of dueDatePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      try {
        const dateStr = match[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          result.due_date = date.toISOString().split('T')[0];
          console.log(`Extracted due date: ${result.due_date}`);
          foundDueDate = true;
          break;
        }
      } catch (e) {
        console.warn(`Error parsing date: ${e.message}`);
      }
    }
  }

  if (!foundDueDate) {
    console.log("No due date found");
  }

  // Extract invoice date
  const invoiceDatePatterns = [
    /Invoice\s+Date[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Invoice\s+Date[:\s]*(\d{1,2}-\d{1,2}-\d{2,4})/i,
    /Date[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /Date[:\s]*(\d{1,2}-\d{1,2}-\d{2,4})/i,
    /Date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /invoice\s+date[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i,
    /bill\s+date[:\s]*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4}))/i
  ];

  let foundInvoiceDate = false;
  for (const pattern of invoiceDatePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      try {
        const dateStr = match[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          result.invoice_date = date.toISOString().split('T')[0];
          console.log(`Extracted invoice date: ${result.invoice_date}`);
          foundInvoiceDate = true;
          break;
        }
      } catch (e) {
        console.warn(`Error parsing invoice date: ${e.message}`);
      }
    }
  }

  if (!foundInvoiceDate) {
    console.log("No invoice date found, using current date");
    result.invoice_date = new Date().toISOString().split('T')[0];
  }

  // Extract description (use subject or look for description patterns)
  if (subject) {
    result.description = subject;
  } else {
    // Try to extract description from content
    const descriptionPatterns = [
      /Description[:\s]*([^\n\r]+)/i,
      /Re:[:\s]*([^\n\r]+)/i,
      /Regarding[:\s]*([^\n\r]+)/i,
      /Subject[:\s]*([^\n\r]+)/i,
      /Service[:\s]*([^\n\r]+)/i,
      /Item[:\s]*([^\n\r]+)/i
    ];

    for (const pattern of descriptionPatterns) {
      const match = content.match(pattern);
      if (match && match[1] && match[1].trim()) {
        result.description = match[1].trim();
        console.log(`Extracted description: ${result.description}`);
        break;
      }
    }
  }

  return result;
}
