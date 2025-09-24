export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  vendor_name: string;
  association_id: string;
  total_amount: number;
  net_amount: number;
  po_date: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  created_by: string;
  approved_by?: string;
  description?: string;
  department?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderLine {
  id: string;
  po_id: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  gl_account_code?: string;
}

export interface CreatePurchaseOrderData {
  vendor_id: string;
  association_id: string;
  description?: string;
  department?: string;
  line_items: {
    description: string;
    quantity: number;
    unit_price: number;
    gl_account_code?: string;
  }[];
}

export interface PurchaseOrderWithLines extends PurchaseOrder {
  lines?: PurchaseOrderLine[];
  purchase_order_lines?: PurchaseOrderLine[];
  approval_status: string;
  requested_by: string;
}

export class PurchaseOrderService {
  private static mockPOs: PurchaseOrderWithLines[] = [
    {
      id: '1',
      po_number: 'PO-202401-0001',
      vendor_id: 'vendor-1',
      vendor_name: 'Mock Vendor Inc.',
      association_id: 'mock-association',
      total_amount: 1500.00,
      net_amount: 1500.00,
      po_date: new Date().toISOString().split('T')[0],
      status: 'approved',
      created_by: 'user-1',
      description: 'Office supplies',
      department: 'Administration',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approval_status: 'approved',
      requested_by: 'John Doe',
      lines: [
        {
          id: '1',
          po_id: '1',
          line_number: 1,
          description: 'Office supplies',
          quantity: 10,
          unit_price: 150.00,
          line_total: 1500.00,
          gl_account_code: '6100'
        }
      ]
    }
  ];
  
  static async getPurchaseOrders(associationId: string): Promise<PurchaseOrderWithLines[]> {
    return this.mockPOs.filter(po => 
      po.association_id === associationId || po.association_id === 'mock-association'
    );
  }

  static async getPurchaseOrder(id: string): Promise<PurchaseOrderWithLines> {
    const po = this.mockPOs.find(p => p.id === id);
    if (!po) throw new Error('Purchase order not found');
    return po;
  }

  static async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<string> {
    const poNumber = await this.generatePONumber();
    const totalAmount = data.line_items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    );

    const newPO: PurchaseOrderWithLines = {
      id: crypto.randomUUID(),
      po_number: poNumber,
      vendor_id: data.vendor_id,
      vendor_name: 'Mock Vendor',
      association_id: data.association_id,
      total_amount: totalAmount,
      net_amount: totalAmount,
      po_date: new Date().toISOString().split('T')[0],
      status: 'draft',
      created_by: 'current-user',
      description: data.description,
      department: data.department,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approval_status: 'pending',
      requested_by: 'Current User',
      lines: data.line_items.map((item, index) => ({
        id: crypto.randomUUID(),
        po_id: '',
        line_number: index + 1,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.quantity * item.unit_price,
        gl_account_code: item.gl_account_code
      }))
    };

    newPO.lines?.forEach(line => line.po_id = newPO.id);
    this.mockPOs.push(newPO);

    return newPO.id;
  }

  static async updatePurchaseOrder(
    id: string, 
    updates: Partial<PurchaseOrder>,
    lineItems?: Partial<PurchaseOrderLine>[]
  ): Promise<void> {
    const index = this.mockPOs.findIndex(po => po.id === id);
    if (index === -1) throw new Error('Purchase order not found');

    this.mockPOs[index] = {
      ...this.mockPOs[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (lineItems) {
      this.mockPOs[index].lines = lineItems.map((item, idx) => ({
        id: item.id || crypto.randomUUID(),
        po_id: id,
        line_number: idx + 1,
        description: item.description || '',
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        line_total: (item.quantity || 0) * (item.unit_price || 0),
        gl_account_code: item.gl_account_code
      }));
    }
  }

  static async approvePurchaseOrder(id: string, approvalLevel: number): Promise<void> {
    const po = this.mockPOs.find(p => p.id === id);
    if (!po) throw new Error('Purchase order not found');

    po.status = 'approved';
    po.approved_by = 'current-user';
    po.notes = `Approved at level ${approvalLevel}`;
    po.updated_at = new Date().toISOString();
  }

  static async rejectPurchaseOrder(id: string, rejectionReason: string): Promise<void> {
    const po = this.mockPOs.find(p => p.id === id);
    if (!po) throw new Error('Purchase order not found');

    po.status = 'rejected';
    po.approved_by = 'current-user';
    po.notes = rejectionReason;
    po.updated_at = new Date().toISOString();
  }

  static async submitForApproval(id: string): Promise<void> {
    const po = this.mockPOs.find(p => p.id === id);
    if (!po) throw new Error('Purchase order not found');

    po.status = 'pending_approval';
    po.updated_at = new Date().toISOString();
  }

  static async deletePurchaseOrder(id: string): Promise<void> {
    const index = this.mockPOs.findIndex(po => po.id === id);
    if (index === -1) throw new Error('Purchase order not found');

    this.mockPOs.splice(index, 1);
  }

  private static async generatePONumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const existingPOs = this.mockPOs.filter(po => 
      po.po_number.startsWith(`PO-${year}${month}`)
    );

    const sequenceNumber = existingPOs.length + 1;
    return `PO-${year}${month}-${String(sequenceNumber).padStart(4, '0')}`;
  }

  static getRequiredApprovalLevel(amount: number): number {
    if (amount >= 50000) return 3;
    if (amount >= 10000) return 2;
    if (amount >= 1000) return 1;
    return 0;
  }

  static canUserApprove(userRole: string, approvalLevel: number): boolean {
    switch (approvalLevel) {
      case 0: return true;
      case 1: return ['supervisor', 'manager', 'admin'].includes(userRole);
      case 2: return ['manager', 'admin'].includes(userRole);
      case 3: return userRole === 'admin';
      default: return false;
    }
  }
}