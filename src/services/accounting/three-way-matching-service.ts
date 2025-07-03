import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type ThreeWayMatch = Database['public']['Tables']['three_way_matches']['Row'];
type ThreeWayMatchInsert = Database['public']['Tables']['three_way_matches']['Insert'];

export interface MatchingException {
  id: string;
  type: 'quantity' | 'price' | 'amount' | 'vendor' | 'missing_document';
  description: string;
  po_amount?: number;
  receipt_amount?: number;
  invoice_amount?: number;
  variance_amount?: number;
  variance_percentage?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ThreeWayMatchResult {
  match_id: string;
  status: 'matched' | 'exception' | 'manual_review';
  confidence_score: number;
  exceptions: MatchingException[];
  auto_approved: boolean;
  requires_approval: boolean;
  approval_level_required: number;
}

export interface MatchingTolerances {
  price_variance_percentage: number;
  quantity_variance_percentage: number;
  amount_variance_absolute: number;
  auto_approve_threshold: number;
}

export class ThreeWayMatchingService {
  
  private static defaultTolerances: MatchingTolerances = {
    price_variance_percentage: 5.0,    // 5% price variance allowed
    quantity_variance_percentage: 2.0, // 2% quantity variance allowed
    amount_variance_absolute: 100.0,   // $100 absolute variance allowed
    auto_approve_threshold: 1000.0     // Auto-approve if under $1000 total
  };

  static async performThreeWayMatch(
    poId: string,
    receiptId: string,
    invoiceId: string,
    tolerances?: Partial<MatchingTolerances>
  ): Promise<ThreeWayMatchResult> {
    const matchingTolerance = { ...this.defaultTolerances, ...tolerances };
    
    // Get PO, Receipt, and Invoice data
    const [poData, receiptData, invoiceData] = await Promise.all([
      this.getPOData(poId),
      this.getReceiptData(receiptId),
      this.getInvoiceData(invoiceId)
    ]);

    // Perform matching analysis
    const exceptions = await this.analyzeDocuments(poData, receiptData, invoiceData, matchingTolerance);
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(exceptions);
    
    // Determine approval requirements
    const totalAmount = Math.max(
      poData.total_amount || 0,
      receiptData.total_received || 0,
      invoiceData.amount || 0
    );
    
    const requiresApproval = exceptions.some(e => e.severity === 'high' || e.severity === 'critical') ||
                           totalAmount > matchingTolerance.auto_approve_threshold;
    
    const autoApproved = !requiresApproval && exceptions.length === 0;
    
    // Get association ID from PO
    const associationId = poData.association_id;
    
    // Create match record
    const matchRecord: ThreeWayMatchInsert = {
      association_id: associationId,
      purchase_order_id: poId,
      receipt_id: receiptId,
      invoice_id: invoiceId,
      match_status: exceptions.length === 0 ? 'matched' : (exceptions.some(e => e.severity === 'critical') ? 'exception' : 'manual_review'),
      variance_amount: totalAmount,
      variance_percentage: 0,
      tolerance_exceeded: exceptions.length > 0
    };

    const { data: match, error } = await supabase
      .from('three_way_matches')
      .insert(matchRecord)
      .select()
      .single();

    if (error) throw error;

    return {
      match_id: match.id,
      status: match.match_status as 'matched' | 'exception' | 'manual_review',
      confidence_score: confidenceScore,
      exceptions,
      auto_approved: autoApproved,
      requires_approval: requiresApproval,
      approval_level_required: 0
    };
  }

  static async getThreeWayMatches(associationId: string) {
    const { data, error } = await supabase
      .from('three_way_matches')
      .select(`
        *,
        purchase_order:purchase_orders (po_number, total_amount, vendor_id),
        receipt:receipts (receipt_number, total_received),
        invoice:invoices (invoice_number, total_amount)
      `)
      .eq('purchase_order.association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async approveMatch(matchId: string, approvedBy: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('three_way_matches')
      .update({
        match_status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (error) throw error;
  }

  static async rejectMatch(matchId: string, rejectionReason: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('three_way_matches')
      .update({
        match_status: 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      })
      .eq('id', matchId);

    if (error) throw error;
  }

  static async overrideMatch(
    matchId: string, 
    overrideReason: string, 
    newStatus: 'approved' | 'rejected'
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('three_way_matches')
      .update({
        match_status: newStatus,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        override_reason: overrideReason,
        is_manual_override: true
      })
      .eq('id', matchId);

    if (error) throw error;
  }

  private static async getPOData(poId: string) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        purchase_order_lines (*)
      `)
      .eq('id', poId)
      .single();

    if (error) throw error;
    return data;
  }

  private static async getReceiptData(receiptId: string) {
    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        receipt_lines (*)
      `)
      .eq('id', receiptId)
      .single();

    if (error) throw error;
    return data;
  }

  private static async getInvoiceData(invoiceId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_line_items (*)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    return data;
  }

  private static async analyzeDocuments(
    poData: any, 
    receiptData: any, 
    invoiceData: any, 
    tolerances: MatchingTolerances
  ): Promise<MatchingException[]> {
    const exceptions: MatchingException[] = [];

    // Vendor validation
    if (poData.vendor_id !== invoiceData.vendor_id) {
      exceptions.push({
        id: 'vendor-mismatch',
        type: 'vendor',
        description: 'Purchase Order and Invoice have different vendors',
        severity: 'critical'
      });
    }

    // Amount validation
    const poAmount = poData.total_amount || 0;
    const receiptAmount = receiptData.total_received || 0;
    const invoiceAmount = invoiceData.total_amount || 0;

    const maxAmount = Math.max(poAmount, receiptAmount, invoiceAmount);
    
    // PO vs Invoice amount check
    const poInvoiceVariance = Math.abs(poAmount - invoiceAmount);
    const poInvoiceVariancePercentage = maxAmount > 0 ? (poInvoiceVariance / maxAmount) * 100 : 0;
    
    if (poInvoiceVariance > tolerances.amount_variance_absolute && 
        poInvoiceVariancePercentage > tolerances.price_variance_percentage) {
      exceptions.push({
        id: 'po-invoice-amount',
        type: 'amount',
        description: `PO amount ($${poAmount}) differs from Invoice amount ($${invoiceAmount}) by $${poInvoiceVariance} (${poInvoiceVariancePercentage.toFixed(1)}%)`,
        po_amount: poAmount,
        invoice_amount: invoiceAmount,
        variance_amount: poInvoiceVariance,
        variance_percentage: poInvoiceVariancePercentage,
        severity: poInvoiceVariancePercentage > 10 ? 'high' : 'medium'
      });
    }

    // Receipt vs Invoice amount check
    const receiptInvoiceVariance = Math.abs(receiptAmount - invoiceAmount);
    const receiptInvoiceVariancePercentage = maxAmount > 0 ? (receiptInvoiceVariance / maxAmount) * 100 : 0;
    
    if (receiptInvoiceVariance > tolerances.amount_variance_absolute && 
        receiptInvoiceVariancePercentage > tolerances.price_variance_percentage) {
      exceptions.push({
        id: 'receipt-invoice-amount',
        type: 'amount',
        description: `Receipt amount ($${receiptAmount}) differs from Invoice amount ($${invoiceAmount}) by $${receiptInvoiceVariance} (${receiptInvoiceVariancePercentage.toFixed(1)}%)`,
        receipt_amount: receiptAmount,
        invoice_amount: invoiceAmount,
        variance_amount: receiptInvoiceVariance,
        variance_percentage: receiptInvoiceVariancePercentage,
        severity: receiptInvoiceVariancePercentage > 10 ? 'high' : 'medium'
      });
    }

    // Line-level validation
    const lineExceptions = await this.validateLineItems(
      poData.purchase_order_lines,
      receiptData.receipt_lines,
      invoiceData.invoice_line_items,
      tolerances
    );
    
    exceptions.push(...lineExceptions);

    return exceptions;
  }

  private static async validateLineItems(
    poLines: any[],
    receiptLines: any[],
    invoiceLines: any[],
    tolerances: MatchingTolerances
  ): Promise<MatchingException[]> {
    const exceptions: MatchingException[] = [];

    // Group receipt lines by PO line
    const receiptsByPOLine = receiptLines.reduce((acc, receipt) => {
      if (!acc[receipt.po_line_id]) acc[receipt.po_line_id] = [];
      acc[receipt.po_line_id].push(receipt);
      return acc;
    }, {} as Record<string, any[]>);

    // Validate each PO line
    poLines.forEach((poLine, index) => {
      const relatedReceipts = receiptsByPOLine[poLine.id] || [];
      const totalReceived = relatedReceipts.reduce((sum, r) => sum + r.quantity_received, 0);
      
      // Find matching invoice line (by line number or description similarity)
      const matchingInvoiceLine = invoiceLines.find(il => 
        il.line_number === poLine.line_number ||
        this.calculateSimilarity(il.description, poLine.description) > 0.8
      );

      if (!matchingInvoiceLine) {
        exceptions.push({
          id: `line-missing-${index}`,
          type: 'missing_document',
          description: `PO line ${poLine.line_number}: "${poLine.description}" not found in invoice`,
          severity: 'medium'
        });
        return;
      }

      // Quantity validation
      const qtyVariance = Math.abs(totalReceived - matchingInvoiceLine.quantity);
      const qtyVariancePercentage = poLine.quantity > 0 ? (qtyVariance / poLine.quantity) * 100 : 0;
      
      if (qtyVariancePercentage > tolerances.quantity_variance_percentage) {
        exceptions.push({
          id: `line-quantity-${index}`,
          type: 'quantity',
          description: `Line ${poLine.line_number}: Received quantity (${totalReceived}) differs from invoiced quantity (${matchingInvoiceLine.quantity})`,
          variance_percentage: qtyVariancePercentage,
          severity: qtyVariancePercentage > 10 ? 'high' : 'medium'
        });
      }

      // Price validation
      const priceVariance = Math.abs(poLine.unit_price - matchingInvoiceLine.unit_price);
      const priceVariancePercentage = poLine.unit_price > 0 ? (priceVariance / poLine.unit_price) * 100 : 0;
      
      if (priceVariancePercentage > tolerances.price_variance_percentage) {
        exceptions.push({
          id: `line-price-${index}`,
          type: 'price',
          description: `Line ${poLine.line_number}: PO unit price ($${poLine.unit_price}) differs from invoice unit price ($${matchingInvoiceLine.unit_price})`,
          variance_percentage: priceVariancePercentage,
          severity: priceVariancePercentage > 15 ? 'high' : 'medium'
        });
      }
    });

    return exceptions;
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    // Simple string similarity calculation
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private static calculateConfidenceScore(exceptions: MatchingException[]): number {
    if (exceptions.length === 0) return 100;
    
    let totalDeduction = 0;
    exceptions.forEach(exception => {
      switch (exception.severity) {
        case 'critical': totalDeduction += 40; break;
        case 'high': totalDeduction += 25; break;
        case 'medium': totalDeduction += 15; break;
        case 'low': totalDeduction += 5; break;
      }
    });
    
    return Math.max(0, 100 - totalDeduction);
  }

  private static getRequiredApprovalLevel(exceptions: MatchingException[], totalAmount: number): number {
    const hasCritical = exceptions.some(e => e.severity === 'critical');
    const hasHigh = exceptions.some(e => e.severity === 'high');
    
    if (hasCritical || totalAmount >= 50000) return 3; // Executive approval
    if (hasHigh || totalAmount >= 10000) return 2;     // Manager approval
    if (exceptions.length > 0 || totalAmount >= 1000) return 1; // Supervisor approval
    return 0; // Auto-approve
  }

  static async getMatchingStatistics(associationId: string) {
    const { data } = await supabase
      .from('three_way_matches')
      .select(`
        match_status,
        created_at
      `)
      .eq('association_id', associationId);

    if (!data) return null;

    const totalMatches = data.length;
    const autoApproved = data.filter(m => m.match_status === 'matched').length;
    const matchedCount = data.filter(m => m.match_status === 'matched').length;
    const exceptionCount = data.filter(m => m.match_status === 'exception').length;
    const avgConfidence = 85; // Mock confidence score

    return {
      total_matches: totalMatches,
      auto_approved_count: autoApproved,
      auto_approval_rate: totalMatches > 0 ? (autoApproved / totalMatches) * 100 : 0,
      matched_count: matchedCount,
      exception_count: exceptionCount,
      manual_review_count: data.filter(m => m.match_status === 'manual_review').length,
      average_confidence: avgConfidence,
      match_success_rate: totalMatches > 0 ? (matchedCount / totalMatches) * 100 : 0
    };
  }
}