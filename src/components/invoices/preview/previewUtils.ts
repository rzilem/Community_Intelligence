
/**
 * Utility functions for invoice preview
 */

export const isInvoicePreviewable = (content?: string): boolean => {
  if (!content) return false;
  
  const lowerContent = content.toLowerCase();
  
  // Patterns that indicate non-invoice content or default placeholder content
  const nonInvoicePatterns = [
    /user-agent:/,
    /robots\.txt/,
    /sitemap:/,
    /disallow:/,
    /allow:\s*\//,
    /^see what happens/i,  // CloudMailin placeholder
    /this is a multi-part message in mime format/i  // Common MIME message header
  ];
  
  // Check if content contains patterns indicating it's not an invoice
  const containsNonInvoiceContent = nonInvoicePatterns.some(pattern => pattern.test(lowerContent));
  
  // If it contains non-invoice content, we need to check if it also has invoice-related terms
  // that would override the non-invoice classification
  
  // Invoice-related terms to check for - expanded list for better detection
  const invoiceRelatedTerms = [
    /invoice/i,
    /total/i,
    /amount due/i,
    /payment/i,
    /due date/i,
    /bill/i,
    /receipt/i,
    /statement/i,
    /balance/i,
    /order/i,
    /purchase/i,
    /paid/i,
    /\$\s*[\d,\.]+/,  // Dollar amount pattern
    /amount:/i,
    /subtotal/i,
    /tax/i,
    /invoice #/i,
    /invoice no/i,
    /account/i,
    /vendor/i,
    /customer/i,
    /qty|quantity/i,
    /price/i,
    /po\s*#|purchase\s*order/i,
    /reference/i,
    /payable/i
  ];
  
  // Check if content contains invoice-related terms
  const containsInvoiceTerms = invoiceRelatedTerms.some(term => term.test(content));
  
  // Either it doesn't have non-invoice content or it explicitly has invoice terms
  return (!containsNonInvoiceContent) || containsInvoiceTerms;
};

/**
 * Detect if the content is likely an email with an attachment
 * This helps inform users when there's a PDF mentioned but not available
 */
export const detectPdfMention = (content?: string): boolean => {
  if (!content) return false;
  
  const lowerContent = content.toLowerCase();
  
  // Patterns that indicate a PDF attachment might be mentioned
  const pdfMentionPatterns = [
    /attach(ed|ment)/i,
    /pdf/i,
    /document attached/i,
    /please find/i,
    /enclosed/i,
    /see attached/i
  ];
  
  return pdfMentionPatterns.some(pattern => pattern.test(lowerContent));
};

/**
 * Get a snippet of invoice-related content for display in fallback scenarios
 */
export const getInvoiceContentSnippet = (content?: string): string => {
  if (!content) return '';
  
  // Try to extract the most relevant part of the invoice
  const amountMatch = content.match(/\$\s*[\d,\.]+/);
  const invoiceNumberMatch = content.match(/invoice\s*#?\s*[a-z0-9\-]+/i);
  const dateMatch = content.match(/date:?\s*[a-z0-9\-\/,\s]+/i);
  
  if (amountMatch || invoiceNumberMatch || dateMatch) {
    return [
      invoiceNumberMatch?.[0],
      dateMatch?.[0],
      amountMatch?.[0]
    ].filter(Boolean).join(' - ');
  }
  
  // If no specific invoice data found, return short preview
  return content.substring(0, 100) + '...';
};
