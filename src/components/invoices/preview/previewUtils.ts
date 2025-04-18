
export const isInvoicePreviewable = (content?: string): boolean => {
  if (!content) return false;
  
  const lowerContent = content.toLowerCase();
  const nonInvoicePatterns = [
    /user-agent:/,
    /robots\.txt/,
    /sitemap:/,
    /disallow:/,
    /allow:\s*\//
  ];
  
  const containsNonInvoiceContent = nonInvoicePatterns.some(pattern => pattern.test(lowerContent));
  
  const invoiceRelatedTerms = [
    /invoice/i,
    /total/i,
    /amount/i,
    /payment/i,
    /due date/i,
    /bill/i,
    /receipt/i
  ];
  
  const containsInvoiceTerms = invoiceRelatedTerms.some(term => term.test(content));
  
  return !containsNonInvoiceContent || containsInvoiceTerms;
};
