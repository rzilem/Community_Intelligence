export interface ThreeWayMatch {
  id: string;
  association_id: string;
  purchase_order_id: string;
  receipt_id: string;
  invoice_id: string;
  match_status: 'matched' | 'pending' | 'discrepancy';
  po_amount: number;
  receipt_amount: number;
  invoice_amount: number;
  discrepancy_amount: number;
  discrepancy_reason?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  resolved_by?: string;
  resolved_at?: string;
}

export interface MatchDiscrepancy {
  field: string;
  po_value: any;
  receipt_value: any;
  invoice_value: any;
  variance: number;
  variance_percent: number;
}

export interface MatchingException {
  id: string;
  type: 'quantity' | 'price' | 'amount' | 'vendor' | 'missing_document';
  severity: 'low' | 'medium' | 'high';
  message: string;
  amount_variance?: number;
  recommended_action: string;
}

export class ThreeWayMatchingService {
  private static mockMatches: ThreeWayMatch[] = [
    {
      id: '1',
      association_id: 'default-hoa',
      purchase_order_id: 'po-1',
      receipt_id: 'rec-1',
      invoice_id: 'inv-1',
      match_status: 'matched',
      po_amount: 1000,
      receipt_amount: 1000,
      invoice_amount: 1000,
      discrepancy_amount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-1'
    },
    {
      id: '2',
      association_id: 'default-hoa',
      purchase_order_id: 'po-2',
      receipt_id: 'rec-2',
      invoice_id: 'inv-2',
      match_status: 'discrepancy',
      po_amount: 1500,
      receipt_amount: 1500,
      invoice_amount: 1650,
      discrepancy_amount: 150,
      discrepancy_reason: 'Invoice amount exceeds PO by $150',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-1'
    }
  ];

  static async performThreeWayMatch(
    associationId: string,
    purchaseOrderId: string,
    receiptId: string,
    invoiceId: string
  ): Promise<ThreeWayMatch> {
    // Simulate matching logic
    await new Promise(resolve => setTimeout(resolve, 500));

    const newMatch: ThreeWayMatch = {
      id: crypto.randomUUID(),
      association_id: associationId,
      purchase_order_id: purchaseOrderId,
      receipt_id: receiptId,
      invoice_id: invoiceId,
      match_status: 'matched', // Default to matched for demo
      po_amount: 1000,
      receipt_amount: 1000,
      invoice_amount: 1000,
      discrepancy_amount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current-user'
    };

    this.mockMatches.push(newMatch);
    return newMatch;
  }

  static async getMatches(associationId: string): Promise<ThreeWayMatch[]> {
    return this.mockMatches.filter(match => match.association_id === associationId);
  }

  static async getMatch(matchId: string): Promise<ThreeWayMatch | null> {
    return this.mockMatches.find(match => match.id === matchId) || null;
  }

  static async getMatchesByStatus(
    associationId: string,
    status: 'matched' | 'pending' | 'discrepancy'
  ): Promise<ThreeWayMatch[]> {
    return this.mockMatches.filter(
      match => match.association_id === associationId && match.match_status === status
    );
  }

  static async resolveDiscrepancy(
    matchId: string,
    resolution: 'approve' | 'reject',
    notes?: string
  ): Promise<void> {
    const match = this.mockMatches.find(m => m.id === matchId);
    if (match) {
      match.match_status = resolution === 'approve' ? 'matched' : 'pending';
      match.resolved_by = 'current-user';
      match.resolved_at = new Date().toISOString();
      match.updated_at = new Date().toISOString();
      if (notes) {
        match.discrepancy_reason = (match.discrepancy_reason || '') + ` | Resolution: ${notes}`;
      }
    }
  }

  static async getDiscrepancyDetails(matchId: string): Promise<MatchDiscrepancy[]> {
    // Mock discrepancy details
    return [
      {
        field: 'Total Amount',
        po_value: 1500,
        receipt_value: 1500,
        invoice_value: 1650,
        variance: 150,
        variance_percent: 10
      },
      {
        field: 'Line Item 1 - Quantity',
        po_value: 10,
        receipt_value: 10,
        invoice_value: 11,
        variance: 1,
        variance_percent: 10
      }
    ];
  }

  static async generateMatchReport(
    associationId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const matches = this.mockMatches.filter(
      match => match.association_id === associationId &&
      match.created_at >= startDate &&
      match.created_at <= endDate
    );

    return {
      total_matches: matches.length,
      matched_count: matches.filter(m => m.match_status === 'matched').length,
      pending_count: matches.filter(m => m.match_status === 'pending').length,
      discrepancy_count: matches.filter(m => m.match_status === 'discrepancy').length,
      total_discrepancy_amount: matches
        .filter(m => m.match_status === 'discrepancy')
        .reduce((sum, m) => sum + m.discrepancy_amount, 0),
      match_rate: matches.length > 0 
        ? (matches.filter(m => m.match_status === 'matched').length / matches.length) * 100 
        : 0
    };
  }

  static async deleteMatch(matchId: string): Promise<void> {
    const index = this.mockMatches.findIndex(m => m.id === matchId);
    if (index !== -1) {
      this.mockMatches.splice(index, 1);
    }
  }

  static async getThreeWayMatches(associationId: string): Promise<ThreeWayMatch[]> {
    return this.getMatches(associationId);
  }

  static async getMatchingStatistics(associationId: string): Promise<any> {
    const matches = await this.getMatches(associationId);
    return {
      total: matches.length,
      matched: matches.filter(m => m.match_status === 'matched').length,
      pending: matches.filter(m => m.match_status === 'pending').length,
      discrepancies: matches.filter(m => m.match_status === 'discrepancy').length
    };
  }

  static async approveMatch(matchId: string): Promise<void> {
    const match = this.mockMatches.find(m => m.id === matchId);
    if (match) {
      match.match_status = 'matched';
      match.updated_at = new Date().toISOString();
    }
  }

  static async rejectMatch(matchId: string, reason: string): Promise<void> {
    const match = this.mockMatches.find(m => m.id === matchId);
    if (match) {
      match.match_status = 'pending';
      match.discrepancy_reason = reason;
      match.updated_at = new Date().toISOString();
    }
  }

  static async overrideMatch(matchId: string, overrideData: any): Promise<void> {
    const match = this.mockMatches.find(m => m.id === matchId);
    if (match) {
      match.match_status = 'matched';
      match.discrepancy_reason = `Override: ${overrideData.reason}`;
      match.updated_at = new Date().toISOString();
    }
  }
}