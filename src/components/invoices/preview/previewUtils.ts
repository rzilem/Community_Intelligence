
export const isInvoicePreviewable = (content?: string): boolean => {
  if (!content) return false;
  
  const lowerContent = content.toLowerCase();
  
  // Patterns that indicate non-invoice content
  const nonInvoicePatterns = [
    /user-agent:/,
    /robots\.txt/,
    /sitemap:/,
    /disallow:/,
    /allow:\s*\//,
    /^see what happens/i  // CloudMailin placeholder
  ];
  
  // Check if content contains patterns indicating it's not an invoice
  const containsNonInvoiceContent = nonInvoicePatterns.some(pattern => pattern.test(lowerContent));
  
  // Invoice-related terms to check for
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
    /\$\s*[\d,\.]+/  // Dollar amount pattern
  ];
  
  // Check if content contains invoice-related terms
  const containsInvoiceTerms = invoiceRelatedTerms.some(term => term.test(content));
  
  // Either it doesn't have non-invoice content or it explicitly has invoice terms
  return !containsNonInvoiceContent || containsInvoiceTerms;
};
