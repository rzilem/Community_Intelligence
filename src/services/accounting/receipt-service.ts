import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Receipt = Database['public']['Tables']['receipts']['Row'];
type ReceiptInsert = Database['public']['Tables']['receipts']['Insert'];
type ReceiptUpdate = Database['public']['Tables']['receipts']['Update'];
type ReceiptLine = Database['public']['Tables']['receipt_lines']['Row'];
type ReceiptLineInsert = Database['public']['Tables']['receipt_lines']['Insert'];

export interface CreateReceiptData {
  po_id: string;
  association_id: string;
  vendor_id: string;
  delivery_note?: string;
  received_by?: string;
  line_items: {
    po_line_id: string;
    quantity_received: number;
    unit_price?: number;
    condition?: string;
    notes?: string;
  }[];
}

export interface ReceiptWithLines extends Receipt {
  receipt_lines: ReceiptLine[];
  purchase_order?: {
    po_number: string;
    description?: string;
  };
  vendor_name?: string;
  received_by_name?: string;
}

export class ReceiptService {
  
  static async getReceipts(associationId: string): Promise<ReceiptWithLines[]> {
    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        receipt_lines (*),
        purchase_order:purchase_orders (po_number, description),
        vendor:vendors (name),
        received_by_profile:profiles!receipts_received_by_fkey (first_name, last_name)
      `)
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(receipt => ({
      ...receipt,
      vendor_name: receipt.vendor?.name,
      received_by_name: receipt.received_by_profile ? 
        `${receipt.received_by_profile.first_name} ${receipt.received_by_profile.last_name}` : undefined
    }));
  }

  static async getReceiptsByPO(poId: string): Promise<ReceiptWithLines[]> {
    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        receipt_lines (*),
        purchase_order:purchase_orders (po_number, description),
        vendor:vendors (name),
        received_by_profile:profiles!receipts_received_by_fkey (first_name, last_name)
      `)
      .eq('po_id', poId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(receipt => ({
      ...receipt,
      vendor_name: receipt.vendor?.name,
      received_by_name: receipt.received_by_profile ? 
        `${receipt.received_by_profile.first_name} ${receipt.received_by_profile.last_name}` : undefined
    }));
  }

  static async getReceipt(id: string): Promise<ReceiptWithLines> {
    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        receipt_lines (*),
        purchase_order:purchase_orders (po_number, description),
        vendor:vendors (name),
        received_by_profile:profiles!receipts_received_by_fkey (first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      vendor_name: data.vendor?.name,
      received_by_name: data.received_by_profile ? 
        `${data.received_by_profile.first_name} ${data.received_by_profile.last_name}` : undefined
    };
  }

  static async createReceipt(data: CreateReceiptData): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Generate receipt number
    const receiptNumber = await this.generateReceiptNumber();
    
    // Calculate total received amount
    const totalReceived = data.line_items.reduce((sum, item) => 
      sum + (item.quantity_received * (item.unit_price || 0)), 0
    );

    // Create receipt
    const receiptData: ReceiptInsert = {
      receipt_number: receiptNumber,
      po_id: data.po_id,
      association_id: data.association_id,
      vendor_id: data.vendor_id,
      total_received: totalReceived,
      delivery_note: data.delivery_note,
      received_by: user.id,
      status: 'received'
    };

    const { data: newReceipt, error: receiptError } = await supabase
      .from('receipts')
      .insert(receiptData)
      .select()
      .single();

    if (receiptError) throw receiptError;

    // Create receipt line items
    const lineItems: ReceiptLineInsert[] = data.line_items.map((item, index) => ({
      receipt_id: newReceipt.id,
      po_line_id: item.po_line_id,
      line_number: index + 1,
      quantity_received: item.quantity_received,
      unit_price: item.unit_price,
      line_total: item.quantity_received * (item.unit_price || 0),
      condition: item.condition || 'good',
      notes: item.notes
    }));

    const { error: lineError } = await supabase
      .from('receipt_lines')
      .insert(lineItems);

    if (lineError) throw lineError;

    // Update PO status if fully received
    await this.updatePOReceiptStatus(data.po_id);

    return newReceipt.id;
  }

  static async updateReceipt(
    id: string, 
    updates: ReceiptUpdate,
    lineItems?: ReceiptLineInsert[]
  ): Promise<void> {
    // Update receipt
    const { error: receiptError } = await supabase
      .from('receipts')
      .update(updates)
      .eq('id', id);

    if (receiptError) throw receiptError;

    // Update line items if provided
    if (lineItems) {
      // Delete existing line items
      await supabase
        .from('receipt_lines')
        .delete()
        .eq('receipt_id', id);

      // Insert new line items
      const { error: lineError } = await supabase
        .from('receipt_lines')
        .insert(lineItems.map(item => ({ ...item, receipt_id: id })));

      if (lineError) throw lineError;
    }
  }

  static async deleteReceipt(id: string): Promise<void> {
    // Get the PO ID before deletion for status update
    const { data: receipt } = await supabase
      .from('receipts')
      .select('po_id')
      .eq('id', id)
      .single();

    // Line items will be automatically deleted due to CASCADE
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update PO receipt status
    if (receipt?.po_id) {
      await this.updatePOReceiptStatus(receipt.po_id);
    }
  }

  private static async generateReceiptNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Get the latest receipt number for this month
    const { data } = await supabase
      .from('receipts')
      .select('receipt_number')
      .like('receipt_number', `REC-${year}${month}-%`)
      .order('receipt_number', { ascending: false })
      .limit(1);

    let sequenceNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].receipt_number.split('-').pop();
      if (lastNumber) {
        sequenceNumber = parseInt(lastNumber) + 1;
      }
    }

    return `REC-${year}${month}-${String(sequenceNumber).padStart(4, '0')}`;
  }

  private static async updatePOReceiptStatus(poId: string): Promise<void> {
    // Get PO line quantities and received quantities
    const { data: poLines } = await supabase
      .from('purchase_order_lines')
      .select('id, quantity')
      .eq('po_id', poId);

    if (!poLines) return;

    const { data: receiptLines } = await supabase
      .from('receipt_lines')
      .select('po_line_id, quantity_received')
      .in('po_line_id', poLines.map(line => line.id));

    if (!receiptLines) return;

    // Calculate receipt status
    let fullyReceived = true;
    let partiallyReceived = false;

    for (const poLine of poLines) {
      const totalReceived = receiptLines
        .filter(rl => rl.po_line_id === poLine.id)
        .reduce((sum, rl) => sum + rl.quantity_received, 0);

      if (totalReceived < poLine.quantity) {
        fullyReceived = false;
      }
      if (totalReceived > 0) {
        partiallyReceived = true;
      }
    }

    // Update PO status
    let newStatus = 'approved';
    if (fullyReceived) {
      newStatus = 'received';
    } else if (partiallyReceived) {
      newStatus = 'partially_received';
    }

    await supabase
      .from('purchase_orders')
      .update({ status: newStatus })
      .eq('id', poId);
  }

  static async getPOReceiptSummary(poId: string) {
    const { data: poLines } = await supabase
      .from('purchase_order_lines')
      .select(`
        id,
        line_number,
        description,
        quantity,
        unit_price,
        line_total
      `)
      .eq('po_id', poId);

    if (!poLines) return [];

    const { data: receiptLines } = await supabase
      .from('receipt_lines')
      .select('po_line_id, quantity_received, unit_price')
      .in('po_line_id', poLines.map(line => line.id));

    return poLines.map(poLine => {
      const received = receiptLines?.filter(rl => rl.po_line_id === poLine.id) || [];
      const totalReceived = received.reduce((sum, rl) => sum + rl.quantity_received, 0);
      const remainingQty = poLine.quantity - totalReceived;

      return {
        ...poLine,
        total_received: totalReceived,
        remaining_quantity: remainingQty,
        receipt_percentage: poLine.quantity > 0 ? (totalReceived / poLine.quantity) * 100 : 0,
        is_fully_received: remainingQty <= 0
      };
    });
  }
}