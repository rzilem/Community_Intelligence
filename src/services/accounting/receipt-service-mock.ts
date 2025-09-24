export interface Receipt {
  id: string;
  po_id: string;
  receipt_number: string;
  received_date: string;
  received_by: string;
  total_amount: number;
  status: 'partial' | 'complete';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReceiptLine {
  id: string;
  receipt_id: string;
  po_line_id: string;
  quantity_received: number;
  unit_cost: number;
  line_total: number;
  condition: 'good' | 'damaged' | 'defective';
  notes?: string;
}

export interface ReceiptWithLines extends Receipt {
  receipt_lines: ReceiptLine[];
  vendor_name: string;
  received_by_name: string;
  purchase_order?: any;
  total_received: number;
  receipt_date: string;
}

export interface CreateReceiptData {
  association_id?: string;
  po_id: string;
  received_date: string;
  received_by: string;
  total_amount: number;
  status: 'partial' | 'complete';
  notes?: string;
  receipt_lines: {
    po_line_id: string;
    quantity_received: number;
    unit_cost: number;
    line_total: number;
    condition: 'good' | 'damaged' | 'defective';
    notes?: string;
  }[];
}

export class ReceiptService {
  private static mockReceipts: ReceiptWithLines[] = [
    {
      id: '1',
      po_id: 'po-1',
      receipt_number: 'REC-001',
      received_date: new Date().toISOString().split('T')[0],
      received_by: 'user-1',
      total_amount: 1000,
      status: 'complete',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      vendor_name: 'Mock Vendor',
      received_by_name: 'John Doe',
      purchase_order: { po_number: 'PO-001', vendor_name: 'Mock Vendor' },
      total_received: 1000,
      receipt_date: new Date().toISOString().split('T')[0],
      receipt_lines: [
        {
          id: '1',
          receipt_id: '1',
          po_line_id: 'pol-1',
          quantity_received: 10,
          unit_cost: 100,
          line_total: 1000,
          condition: 'good'
        }
      ]
    }
  ];

  static async getReceiptsByPO(poId: string): Promise<ReceiptWithLines[]> {
    return this.mockReceipts.filter(receipt => receipt.po_id === poId);
  }

  static async getReceiptsByStatus(status: string): Promise<ReceiptWithLines[]> {
    return this.mockReceipts.filter(receipt => receipt.status === status);
  }

  static async getReceipt(receiptId: string): Promise<ReceiptWithLines | null> {
    return this.mockReceipts.find(receipt => receipt.id === receiptId) || null;
  }

  static async getReceipts(associationId: string): Promise<ReceiptWithLines[]> {
    return this.mockReceipts;
  }

  static async getPOReceiptSummary(poId: string): Promise<any> {
    const receipts = this.mockReceipts.filter(receipt => receipt.po_id === poId);
    const totalReceived = receipts.reduce((sum, r) => sum + r.total_amount, 0);
    return {
      totalReceived,
      receiptCount: receipts.length,
      status: receipts.length > 0 ? 'partial' : 'pending'
    };
  }

  static async createReceipt(receiptData: CreateReceiptData): Promise<string> {
    const newReceipt: ReceiptWithLines = {
      id: crypto.randomUUID(),
      po_id: receiptData.po_id,
      receipt_number: `REC-${String(this.mockReceipts.length + 1).padStart(3, '0')}`,
      received_date: receiptData.received_date,
      received_by: receiptData.received_by,
      total_amount: receiptData.total_amount,
      status: receiptData.status || 'partial',
      notes: receiptData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      vendor_name: 'Mock Vendor',
      received_by_name: 'John Doe',
      purchase_order: { po_number: 'PO-001', vendor_name: 'Mock Vendor' },
      total_received: receiptData.total_amount,
      receipt_date: receiptData.received_date,
      receipt_lines: receiptData.receipt_lines.map(line => ({
        id: crypto.randomUUID(),
        receipt_id: '',
        ...line
      }))
    };

    newReceipt.receipt_lines.forEach(line => line.receipt_id = newReceipt.id);
    this.mockReceipts.push(newReceipt);
    return newReceipt.id;
  }

  static async updateReceiptStatus(receiptId: string, status: string): Promise<void> {
    const receipt = this.mockReceipts.find(r => r.id === receiptId);
    if (receipt) {
      receipt.status = status as any;
      receipt.updated_at = new Date().toISOString();
    }
  }

  static async deleteReceipt(receiptId: string): Promise<void> {
    const index = this.mockReceipts.findIndex(r => r.id === receiptId);
    if (index !== -1) {
      this.mockReceipts.splice(index, 1);
    }
  }

  static async generateReceiptReport(associationId: string): Promise<any> {
    return {
      total_receipts: this.mockReceipts.length,
      pending_receipts: this.mockReceipts.filter(r => r.status === 'partial').length,
      completed_receipts: this.mockReceipts.filter(r => r.status === 'complete').length,
      total_value: this.mockReceipts.reduce((sum, r) => sum + r.total_amount, 0)
    };
  }
}