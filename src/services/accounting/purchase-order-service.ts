import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row'];
type PurchaseOrderInsert = Database['public']['Tables']['purchase_orders']['Insert'];
type PurchaseOrderUpdate = Database['public']['Tables']['purchase_orders']['Update'];
type PurchaseOrderLine = Database['public']['Tables']['purchase_order_lines']['Row'];
type PurchaseOrderLineInsert = Database['public']['Tables']['purchase_order_lines']['Insert'];

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
}

export class PurchaseOrderService {
  
  static async getPurchaseOrders(associationId: string): Promise<PurchaseOrderWithLines[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        purchase_order_lines(*)
      `)
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(po => ({
      ...po,
      lines: po.purchase_order_lines || [],
    }));
  }

  static async getPurchaseOrder(id: string): Promise<PurchaseOrderWithLines> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        purchase_order_lines(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      lines: data.purchase_order_lines || [],
    };
  }

  static async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Generate PO number
    const poNumber = await this.generatePONumber();
    
    // Calculate total amount
    const totalAmount = data.line_items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    );

    // Create purchase order
    const poData: PurchaseOrderInsert = {
      po_number: poNumber,
      vendor_id: data.vendor_id,
      association_id: data.association_id,
      total_amount: totalAmount,
      net_amount: totalAmount,
      vendor_name: 'TBD',
      po_date: new Date().toISOString().split('T')[0],
      created_by: user.id,
      status: 'draft',
      description: data.description,
      department: data.department
    };

    const { data: newPO, error: poError } = await supabase
      .from('purchase_orders')
      .insert(poData)
      .select()
      .single();

    if (poError) throw poError;

    // Create line items
    const lineItems: PurchaseOrderLineInsert[] = data.line_items.map((item, index) => ({
      po_id: newPO.id,
      line_number: index + 1,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.quantity * item.unit_price,
      gl_account_code: item.gl_account_code
    }));

    const { error: lineError } = await supabase
      .from('purchase_order_lines')
      .insert(lineItems);

    if (lineError) throw lineError;

    return newPO.id;
  }

  static async updatePurchaseOrder(
    id: string, 
    updates: PurchaseOrderUpdate,
    lineItems?: PurchaseOrderLineInsert[]
  ): Promise<void> {
    // Update purchase order
    const { error: poError } = await supabase
      .from('purchase_orders')
      .update(updates)
      .eq('id', id);

    if (poError) throw poError;

    // Update line items if provided
    if (lineItems) {
      // Delete existing line items
      await supabase
        .from('purchase_order_lines')
        .delete()
        .eq('po_id', id);

      // Insert new line items
      const { error: lineError } = await supabase
        .from('purchase_order_lines')
        .insert(lineItems.map(item => ({ ...item, po_id: id })));

      if (lineError) throw lineError;
    }
  }

  static async approvePurchaseOrder(id: string, approvalLevel: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updates: PurchaseOrderUpdate = {
      status: 'approved',
      approved_by: user.id,
      notes: `Approved at level ${approvalLevel}`
    };

    const { error } = await supabase
      .from('purchase_orders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async rejectPurchaseOrder(id: string, rejectionReason: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updates: PurchaseOrderUpdate = {
      status: 'rejected',
      approved_by: user.id,
      notes: rejectionReason
    };

    const { error } = await supabase
      .from('purchase_orders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async submitForApproval(id: string): Promise<void> {
    const updates: PurchaseOrderUpdate = {
      status: 'pending_approval'
    };

    const { error } = await supabase
      .from('purchase_orders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async deletePurchaseOrder(id: string): Promise<void> {
    // Line items will be automatically deleted due to CASCADE
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private static async generatePONumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Get the latest PO number for this month
    const { data } = await supabase
      .from('purchase_orders')
      .select('po_number')
      .like('po_number', `PO-${year}${month}-%`)
      .order('po_number', { ascending: false })
      .limit(1);

    let sequenceNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].po_number.split('-').pop();
      if (lastNumber) {
        sequenceNumber = parseInt(lastNumber) + 1;
      }
    }

    return `PO-${year}${month}-${String(sequenceNumber).padStart(4, '0')}`;
  }

  static getRequiredApprovalLevel(amount: number): number {
    if (amount >= 50000) return 3; // Executive approval
    if (amount >= 10000) return 2; // Manager approval
    if (amount >= 1000) return 1;  // Supervisor approval
    return 0; // Auto-approve
  }

  static canUserApprove(userRole: string, approvalLevel: number): boolean {
    switch (approvalLevel) {
      case 0: return true; // Anyone can auto-approve small amounts
      case 1: return ['supervisor', 'manager', 'admin'].includes(userRole);
      case 2: return ['manager', 'admin'].includes(userRole);
      case 3: return userRole === 'admin';
      default: return false;
    }
  }
}