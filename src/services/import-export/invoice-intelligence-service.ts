
import { devLog } from '@/utils/dev-logger';
import { documentClassificationService } from './document-classification-service';
import { advancedOCRService } from './advanced-ocr-service';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  category?: string;
  glAccount?: string;
  taxable?: boolean;
  taxAmount?: number;
  confidence: number;
}

export interface InvoiceHeader {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  vendor: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    taxId?: string;
  };
  billTo: {
    name: string;
    address?: string;
  };
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  confidence: number;
}

export interface ProcessedInvoice {
  header: InvoiceHeader;
  lineItems: InvoiceLineItem[];
  vendorId?: string;
  suggestions: {
    glAccountMappings: Array<{
      description: string;
      suggestedAccount: string;
      confidence: number;
      reasoning: string;
    }>;
    vendorMatches: Array<{
      vendorId: string;
      vendorName: string;
      confidence: number;
      reasoning: string;
    }>;
    duplicateWarnings: string[];
  };
  validation: {
    mathErrors: string[];
    missingFields: string[];
    warnings: string[];
  };
  confidence: number;
}

export interface VendorDatabase {
  id: string;
  name: string;
  normalizedName: string;
  aliases: string[];
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  glAccounts: Record<string, string>; // description pattern -> GL account
  paymentTerms?: string;
  lastUsed: Date;
}

export interface GLAccountDatabase {
  code: string;
  name: string;
  category: string;
  keywords: string[];
  usageCount: number;
  associationId: string;
}

export const invoiceIntelligenceService = {
  async processInvoice(
    file: File,
    associationId: string,
    options: {
      enableVendorMatching?: boolean;
      enableGLSuggestions?: boolean;
      enableDuplicateDetection?: boolean;
    } = {}
  ): Promise<ProcessedInvoice> {
    devLog.info('Starting intelligent invoice processing', { 
      filename: file.name,
      associationId 
    });

    try {
      // Step 1: OCR and Classification
      const ocrResult = await advancedOCRService.processDocument(file, {
        enableTableExtraction: true,
        enableFormDetection: true,
        quality: 'accurate'
      });

      const classificationResult = await documentClassificationService.classifyDocument(
        ocrResult.ocr.text,
        ocrResult
      );

      if (classificationResult.documentType !== 'invoice' && classificationResult.confidence < 0.7) {
        devLog.warn('Document may not be an invoice', classificationResult);
      }

      // Step 2: Extract Invoice Data
      const header = await this.extractInvoiceHeader(ocrResult.ocr.text, ocrResult);
      const lineItems = await this.extractLineItems(ocrResult);

      // Step 3: Enhance with Intelligence
      const suggestions = await this.generateSuggestions(header, lineItems, associationId, options);
      const validation = this.validateInvoice(header, lineItems);

      // Step 4: Calculate overall confidence
      const confidence = this.calculateOverallConfidence(header, lineItems, ocrResult.ocr.confidence);

      const processedInvoice: ProcessedInvoice = {
        header,
        lineItems,
        suggestions,
        validation,
        confidence
      };

      devLog.info('Invoice processing completed', {
        lineItemCount: lineItems.length,
        confidence,
        vendorMatches: suggestions.vendorMatches.length,
        glSuggestions: suggestions.glAccountMappings.length
      });

      return processedInvoice;

    } catch (error) {
      devLog.error('Invoice processing failed', error);
      throw new Error(`Invoice processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async extractInvoiceHeader(text: string, ocrResult: any): Promise<InvoiceHeader> {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    // Extract basic information using patterns
    const invoiceNumber = this.extractPattern(text, [
      /invoice\s*#?\s*:?\s*([A-Z0-9\-]+)/i,
      /inv\s*#?\s*:?\s*([A-Z0-9\-]+)/i,
      /number\s*:?\s*([A-Z0-9\-]+)/i
    ]) || 'UNKNOWN';

    const invoiceDate = this.extractDate(text, [
      /invoice\s*date\s*:?\s*([0-9\/\-\.]+)/i,
      /date\s*:?\s*([0-9\/\-\.]+)/i,
      /dated?\s*:?\s*([0-9\/\-\.]+)/i
    ]);

    const dueDate = this.extractDate(text, [
      /due\s*date\s*:?\s*([0-9\/\-\.]+)/i,
      /payment\s*due\s*:?\s*([0-9\/\-\.]+)/i
    ]);

    // Extract vendor information
    const vendor = this.extractVendorInfo(text, ocrResult);
    
    // Extract bill-to information
    const billTo = this.extractBillToInfo(text);

    // Extract financial totals
    const amounts = this.extractAmounts(text);

    return {
      invoiceNumber,
      invoiceDate: invoiceDate || new Date(),
      dueDate,
      vendor,
      billTo: billTo || { name: 'UNKNOWN' },
      subtotal: amounts.subtotal,
      taxAmount: amounts.tax,
      totalAmount: amounts.total,
      confidence: this.calculateHeaderConfidence(invoiceNumber, vendor.name, amounts.total)
    };
  },

  async extractLineItems(ocrResult: any): Promise<InvoiceLineItem[]> {
    const lineItems: InvoiceLineItem[] = [];

    // First try to extract from tables
    if (ocrResult.tables && ocrResult.tables.totalTables > 0) {
      for (const table of ocrResult.tables.tables) {
        const extractedItems = this.extractLineItemsFromTable(table);
        lineItems.push(...extractedItems);
      }
    }

    // If no tables or insufficient data, try text parsing
    if (lineItems.length === 0) {
      const textItems = this.extractLineItemsFromText(ocrResult.ocr.text);
      lineItems.push(...textItems);
    }

    // Clean and validate line items
    return lineItems.filter(item => 
      item.description && 
      item.description.trim().length > 0 && 
      item.totalAmount > 0
    );
  },

  extractLineItemsFromTable(table: any): InvoiceLineItem[] {
    if (!table.rows || table.rows.length < 2) return [];

    const headers = table.rows[0].map((h: string) => h.toLowerCase().trim());
    const dataRows = table.rows.slice(1);

    // Map column indices
    const colMap = {
      description: this.findColumnIndex(headers, ['description', 'item', 'service', 'product']),
      quantity: this.findColumnIndex(headers, ['qty', 'quantity', 'units']),
      unitPrice: this.findColumnIndex(headers, ['price', 'rate', 'unit', 'cost']),
      total: this.findColumnIndex(headers, ['total', 'amount', 'sum'])
    };

    const lineItems: InvoiceLineItem[] = [];

    dataRows.forEach((row: string[]) => {
      if (row.length === 0) return;

      const description = colMap.description >= 0 ? row[colMap.description] : row[0];
      if (!description || description.trim().length === 0) return;

      const quantity = colMap.quantity >= 0 ? this.parseNumber(row[colMap.quantity]) : 1;
      const unitPrice = colMap.unitPrice >= 0 ? this.parseNumber(row[colMap.unitPrice]) : 0;
      const totalAmount = colMap.total >= 0 ? this.parseNumber(row[colMap.total]) : unitPrice * quantity;

      // Skip if we can't determine a reasonable total
      if (totalAmount <= 0) return;

      lineItems.push({
        description: description.trim(),
        quantity,
        unitPrice: unitPrice || totalAmount / quantity,
        totalAmount,
        confidence: this.calculateLineItemConfidence(description, quantity, unitPrice, totalAmount)
      });
    });

    return lineItems;
  },

  extractLineItemsFromText(text: string): InvoiceLineItem[] {
    const lines = text.split('\n').filter(line => line.trim());
    const lineItems: InvoiceLineItem[] = [];

    for (const line of lines) {
      // Look for lines that contain amounts and descriptions
      const amountMatches = line.match(/\$?[\d,]+\.?\d{0,2}/g);
      if (!amountMatches || amountMatches.length === 0) continue;

      // Extract the largest amount as likely total
      const amounts = amountMatches.map(amt => this.parseNumber(amt)).filter(amt => amt > 0);
      if (amounts.length === 0) continue;

      const totalAmount = Math.max(...amounts);
      if (totalAmount < 0.01) continue;

      // Extract description (text before the first amount)
      const firstAmountIndex = line.indexOf(amountMatches[0]);
      const description = line.substring(0, firstAmountIndex).trim();
      
      if (description.length === 0 || description.length > 200) continue;

      // Simple quantity and unit price estimation
      let quantity = 1;
      let unitPrice = totalAmount;

      if (amounts.length >= 2) {
        // If we have multiple amounts, assume qty * price = total pattern
        const possibleQty = amounts.find(amt => amt <= 1000 && amt >= 1);
        const possiblePrice = amounts.find(amt => amt !== totalAmount && amt !== possibleQty);
        
        if (possibleQty && possiblePrice && Math.abs(possibleQty * possiblePrice - totalAmount) < 0.01) {
          quantity = possibleQty;
          unitPrice = possiblePrice;
        }
      }

      lineItems.push({
        description,
        quantity,
        unitPrice,
        totalAmount,
        confidence: this.calculateLineItemConfidence(description, quantity, unitPrice, totalAmount)
      });
    }

    return lineItems;
  },

  async generateSuggestions(
    header: InvoiceHeader,
    lineItems: InvoiceLineItem[],
    associationId: string,
    options: any
  ): Promise<ProcessedInvoice['suggestions']> {
    const suggestions: ProcessedInvoice['suggestions'] = {
      glAccountMappings: [],
      vendorMatches: [],
      duplicateWarnings: []
    };

    // Generate GL Account suggestions
    if (options.enableGLSuggestions !== false) {
      for (const item of lineItems) {
        const glSuggestion = await this.suggestGLAccount(item.description, associationId);
        if (glSuggestion) {
          suggestions.glAccountMappings.push({
            description: item.description,
            suggestedAccount: glSuggestion.code,
            confidence: glSuggestion.confidence,
            reasoning: glSuggestion.reasoning
          });
        }
      }
    }

    // Generate vendor matches
    if (options.enableVendorMatching !== false) {
      const vendorMatches = await this.findVendorMatches(header.vendor.name, associationId);
      suggestions.vendorMatches = vendorMatches;
    }

    // Check for duplicates
    if (options.enableDuplicateDetection !== false) {
      const duplicateWarnings = await this.checkForDuplicates(header, associationId);
      suggestions.duplicateWarnings = duplicateWarnings;
    }

    return suggestions;
  },

  async suggestGLAccount(description: string, associationId: string): Promise<{
    code: string;
    confidence: number;
    reasoning: string;
  } | null> {
    // Simulated GL account suggestion logic
    const cleanDesc = description.toLowerCase().trim();
    
    // Common GL account mappings
    const glMappings = [
      { keywords: ['maintenance', 'repair', 'fix', 'service'], account: '6200', name: 'Maintenance & Repairs' },
      { keywords: ['electric', 'power', 'utility'], account: '6100', name: 'Utilities - Electric' },
      { keywords: ['water', 'sewer'], account: '6110', name: 'Utilities - Water' },
      { keywords: ['gas', 'propane'], account: '6120', name: 'Utilities - Gas' },
      { keywords: ['landscape', 'lawn', 'garden', 'tree'], account: '6300', name: 'Landscaping' },
      { keywords: ['insurance'], account: '6400', name: 'Insurance' },
      { keywords: ['legal', 'attorney', 'law'], account: '6500', name: 'Legal & Professional' },
      { keywords: ['office', 'supplies', 'paper'], account: '6600', name: 'Office Supplies' },
      { keywords: ['cleaning', 'janitorial'], account: '6700', name: 'Cleaning Services' },
      { keywords: ['security'], account: '6800', name: 'Security Services' }
    ];

    for (const mapping of glMappings) {
      const matchingKeywords = mapping.keywords.filter(keyword => 
        cleanDesc.includes(keyword)
      );
      
      if (matchingKeywords.length > 0) {
        const confidence = Math.min(0.9, 0.5 + (matchingKeywords.length * 0.2));
        return {
          code: mapping.account,
          confidence,
          reasoning: `Matched keywords: ${matchingKeywords.join(', ')} → ${mapping.name}`
        };
      }
    }

    return null;
  },

  async findVendorMatches(vendorName: string, associationId: string): Promise<Array<{
    vendorId: string;
    vendorName: string;
    confidence: number;
    reasoning: string;
  }>> {
    // Simulated vendor matching
    const cleanVendorName = vendorName.toLowerCase().trim();
    
    // In a real implementation, this would query the vendor database
    const mockVendors = [
      { id: '1', name: 'ABC Maintenance Services', normalized: 'abc maintenance services' },
      { id: '2', name: 'City Electric Company', normalized: 'city electric company' },
      { id: '3', name: 'Green Landscaping LLC', normalized: 'green landscaping llc' }
    ];

    const matches = mockVendors
      .map(vendor => ({
        vendorId: vendor.id,
        vendorName: vendor.name,
        confidence: this.calculateStringSimilarity(cleanVendorName, vendor.normalized),
        reasoning: `Name similarity match`
      }))
      .filter(match => match.confidence > 0.6)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return matches;
  },

  async checkForDuplicates(header: InvoiceHeader, associationId: string): Promise<string[]> {
    const warnings: string[] = [];
    
    // Simulated duplicate detection
    // In a real implementation, this would query existing invoices
    
    // Check for duplicate invoice numbers
    const hasMatchingInvoiceNumber = Math.random() > 0.8; // 20% chance of duplicate
    if (hasMatchingInvoiceNumber) {
      warnings.push(`Invoice number ${header.invoiceNumber} may already exist`);
    }

    // Check for similar amounts and dates
    const hasSimilarAmountAndDate = Math.random() > 0.9; // 10% chance
    if (hasSimilarAmountAndDate) {
      warnings.push(`Similar amount ($${header.totalAmount.toFixed(2)}) and date found for vendor ${header.vendor.name}`);
    }

    return warnings;
  },

  validateInvoice(header: InvoiceHeader, lineItems: InvoiceLineItem[]): ProcessedInvoice['validation'] {
    const validation: ProcessedInvoice['validation'] = {
      mathErrors: [],
      missingFields: [],
      warnings: []
    };

    // Check math accuracy
    const calculatedSubtotal = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const expectedTotal = calculatedSubtotal + header.taxAmount;
    
    if (Math.abs(expectedTotal - header.totalAmount) > 0.02) {
      validation.mathErrors.push(
        `Total amount mismatch: Expected $${expectedTotal.toFixed(2)}, found $${header.totalAmount.toFixed(2)}`
      );
    }

    if (Math.abs(calculatedSubtotal - header.subtotal) > 0.02) {
      validation.mathErrors.push(
        `Subtotal mismatch: Calculated $${calculatedSubtotal.toFixed(2)}, found $${header.subtotal.toFixed(2)}`
      );
    }

    // Check for missing required fields
    if (!header.invoiceNumber || header.invoiceNumber === 'UNKNOWN') {
      validation.missingFields.push('Invoice number');
    }
    if (!header.vendor.name || header.vendor.name === 'UNKNOWN') {
      validation.missingFields.push('Vendor name');
    }
    if (header.totalAmount <= 0) {
      validation.missingFields.push('Valid total amount');
    }
    if (lineItems.length === 0) {
      validation.missingFields.push('Line items');
    }

    // Generate warnings
    if (lineItems.some(item => item.confidence < 0.5)) {
      validation.warnings.push('Some line items have low confidence scores');
    }
    if (header.totalAmount > 10000) {
      validation.warnings.push('High invoice amount - please verify');
    }
    if (!header.dueDate) {
      validation.warnings.push('No due date specified');
    }

    return validation;
  },

  // Helper methods
  extractPattern(text: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  },

  extractDate(text: string, patterns: RegExp[]): Date | null {
    const dateStr = this.extractPattern(text, patterns);
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  },

  extractVendorInfo(text: string, ocrResult: any): InvoiceHeader['vendor'] {
    // Simple vendor extraction logic
    const lines = text.split('\n').slice(0, 10); // Look in first 10 lines
    
    for (const line of lines) {
      if (line.trim().length > 5 && line.trim().length < 100) {
        // Look for company-like names
        if (/^[A-Z][A-Za-z\s&,.-]+(?:LLC|Inc|Corp|Co|Company|Services|Group)$/i.test(line.trim())) {
          return {
            name: line.trim(),
            address: this.extractAddress(text),
            phone: this.extractPhone(text),
            email: this.extractEmail(text)
          };
        }
      }
    }
    
    return { name: 'UNKNOWN' };
  },

  extractBillToInfo(text: string): InvoiceHeader['billTo'] | null {
    const billToMatch = text.match(/bill\s*to:?\s*([^\n]{1,100})/i);
    if (billToMatch) {
      return {
        name: billToMatch[1].trim(),
        address: this.extractAddress(text.substring(billToMatch.index! + billToMatch[0].length))
      };
    }
    return null;
  },

  extractAddress(text: string): string | undefined {
    const addressPattern = /\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Way|Lane|Ln)/i;
    const match = text.match(addressPattern);
    return match ? match[0] : undefined;
  },

  extractPhone(text: string): string | undefined {
    const phonePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const match = text.match(phonePattern);
    return match ? match[0] : undefined;
  },

  extractEmail(text: string): string | undefined {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailPattern);
    return match ? match[0] : undefined;
  },

  extractAmounts(text: string): { subtotal: number; tax: number; total: number } {
    const amounts = { subtotal: 0, tax: 0, total: 0 };
    
    // Look for total amount
    const totalMatch = text.match(/total\s*:?\s*\$?([\d,]+\.?\d{0,2})/i);
    if (totalMatch) {
      amounts.total = this.parseNumber(totalMatch[1]);
    }
    
    // Look for subtotal
    const subtotalMatch = text.match(/subtotal\s*:?\s*\$?([\d,]+\.?\d{0,2})/i);
    if (subtotalMatch) {
      amounts.subtotal = this.parseNumber(subtotalMatch[1]);
    }
    
    // Look for tax
    const taxMatch = text.match(/tax\s*:?\s*\$?([\d,]+\.?\d{0,2})/i);
    if (taxMatch) {
      amounts.tax = this.parseNumber(taxMatch[1]);
    }
    
    // If we have total but no subtotal, estimate subtotal
    if (amounts.total > 0 && amounts.subtotal === 0) {
      amounts.subtotal = amounts.total - amounts.tax;
    }
    
    return amounts;
  },

  findColumnIndex(headers: string[], searchTerms: string[]): number {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase();
      if (searchTerms.some(term => header.includes(term))) {
        return i;
      }
    }
    return -1;
  },

  parseNumber(str: string): number {
    if (!str) return 0;
    const cleaned = str.toString().replace(/[$,]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  },

  calculateHeaderConfidence(invoiceNumber: string, vendorName: string, totalAmount: number): number {
    let confidence = 1.0;
    
    if (invoiceNumber === 'UNKNOWN') confidence -= 0.3;
    if (vendorName === 'UNKNOWN') confidence -= 0.4;
    if (totalAmount <= 0) confidence -= 0.3;
    
    return Math.max(0, confidence);
  },

  calculateLineItemConfidence(description: string, quantity: number, unitPrice: number, totalAmount: number): number {
    let confidence = 1.0;
    
    if (!description || description.trim().length === 0) confidence -= 0.4;
    if (quantity <= 0) confidence -= 0.2;
    if (unitPrice <= 0) confidence -= 0.2;
    if (totalAmount <= 0) confidence -= 0.4;
    
    // Check if math makes sense
    if (Math.abs(quantity * unitPrice - totalAmount) > 0.02) {
      confidence -= 0.2;
    }
    
    return Math.max(0, confidence);
  },

  calculateOverallConfidence(header: InvoiceHeader, lineItems: InvoiceLineItem[], ocrConfidence: number): number {
    const headerConfidence = header.confidence;
    const avgLineItemConfidence = lineItems.length > 0 
      ? lineItems.reduce((sum, item) => sum + item.confidence, 0) / lineItems.length
      : 0;
    const normalizedOcrConfidence = ocrConfidence / 100;
    
    // Weighted average
    return (headerConfidence * 0.4 + avgLineItemConfidence * 0.4 + normalizedOcrConfidence * 0.2);
  },

  calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  },

  levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
};
