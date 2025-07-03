import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type PaymentBatch = Database['public']['Tables']['payment_batches']['Row'];
type PaymentBatchInsert = Database['public']['Tables']['payment_batches']['Insert'];
type PaymentTransaction = Database['public']['Tables']['payment_transactions_enhanced']['Row'];
type ResidentPaymentMethod = Database['public']['Tables']['resident_payment_methods']['Row'];

export interface CreatePaymentBatchData {
  association_id: string;
  batch_type: 'ach' | 'check' | 'wire';
  payment_count: number;
  total_amount: number;
  batch_date: string;
  scheduled_date?: string;
}

export interface ACHFileData {
  header: string;
  entries: string[];
  control: string;
  total_amount: number;
  entry_count: number;
}

export class PaymentService {
  
  static async createPaymentBatch(data: CreatePaymentBatchData): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const batchNumber = await this.generateBatchNumber(data.batch_type);
    
    const batchData: PaymentBatchInsert = {
      association_id: data.association_id,
      batch_number: batchNumber,
      batch_type: data.batch_type,
      batch_status: 'draft',
      total_amount: data.total_amount,
      payment_count: data.payment_count,
      batch_date: data.batch_date,
      scheduled_date: data.scheduled_date,
      created_by: user.id
    };

    const { data: newBatch, error } = await supabase
      .from('payment_batches')
      .insert(batchData)
      .select()
      .single();

    if (error) throw error;
    return newBatch.id;
  }

  static async getPaymentBatches(associationId: string): Promise<PaymentBatch[]> {
    const { data, error } = await supabase
      .from('payment_batches')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async processPaymentBatch(batchId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get batch details
    const { data: batch, error: batchError } = await supabase
      .from('payment_batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (batchError) throw batchError;

    // Generate appropriate file based on batch type
    let filePath: string;
    if (batch.batch_type === 'ach') {
      filePath = await this.generateACHFile(batchId);
    } else if (batch.batch_type === 'check') {
      filePath = await this.generateCheckFile(batchId);
    } else {
      filePath = await this.generateWireFile(batchId);
    }

    // Update batch status
    const { error: updateError } = await supabase
      .from('payment_batches')
      .update({
        batch_status: 'processed',
        processed_date: new Date().toISOString(),
        file_generated: true,
        file_path: filePath
      })
      .eq('id', batchId);

    if (updateError) throw updateError;
  }

  static async generateACHFile(batchId: string): Promise<string> {
    // Get batch and related payment transactions
    const { data: batchData } = await supabase
      .from('payment_batches')
      .select(`
        *,
        payment_transactions:payment_transactions_enhanced(*)
      `)
      .eq('id', batchId)
      .single();

    if (!batchData) throw new Error('Batch not found');

    // Generate ACH file content
    const achData = this.buildACHFileContent(batchData);
    
    // Store in Supabase storage
    const fileName = `ach_${batchData.batch_number}_${new Date().toISOString().split('T')[0]}.txt`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('financial_documents')
      .upload(`ach_files/${fileName}`, achData.header + '\n' + achData.entries.join('\n') + '\n' + achData.control, {
        contentType: 'text/plain'
      });

    if (uploadError) throw uploadError;
    return uploadData.path;
  }

  private static buildACHFileContent(batchData: any): ACHFileData {
    const now = new Date();
    const fileCreationDate = now.toISOString().slice(0, 10).replace(/-/g, '');
    const fileCreationTime = now.toTimeString().slice(0, 8).replace(/:/g, '');
    
    // File Header Record (Record Type 1)
    const header = [
      '1',                          // Record Type Code
      '01',                         // Priority Code
      ' 123456789',                 // Immediate Destination (Bank Routing)
      '1234567890',                 // Immediate Origin (Company ID)
      fileCreationDate,             // File Creation Date
      fileCreationTime,             // File Creation Time
      'A',                          // File ID Modifier
      '094',                        // Record Size
      '10',                         // Blocking Factor
      '1',                          // Format Code
      'YOUR BANK NAME'.padEnd(23),  // Immediate Destination Name
      'YOUR COMPANY'.padEnd(23),    // Immediate Origin Name
      ''.padEnd(8)                  // Reference Code
    ].join('');

    // Entry Detail Records (Record Type 6)
    const entries: string[] = [];
    let totalAmount = 0;

    (batchData.payment_transactions || []).forEach((payment: any, index: number) => {
      const entry = [
        '6',                                    // Record Type Code
        '22',                                   // Transaction Code (Checking Credit)
        '123456789',                           // Receiving DFI Identification
        payment.account_number?.slice(-10).padStart(17, '0') || '00000000000000000', // DFI Account Number
        payment.net_amount.toString().replace('.', '').padStart(10, '0'), // Amount
        payment.resident_id?.slice(0, 15).padEnd(15) || ''.padEnd(15),   // Individual Identification
        payment.property_id?.slice(0, 22).padEnd(22) || ''.padEnd(22),   // Individual Name
        '0',                                    // Discretionary Data
        '0'                                     // Addenda Record Indicator
      ].join('');
      
      entries.push(entry);
      totalAmount += payment.net_amount || 0;
    });

    // Batch Control Record (Record Type 8)
    const control = [
      '8',                                      // Record Type Code
      '220',                                    // Service Class Code
      entries.length.toString().padStart(6, '0'), // Entry/Addenda Count
      totalAmount.toString().replace('.', '').padStart(12, '0'), // Entry Hash
      totalAmount.toString().replace('.', '').padStart(12, '0'), // Total Debit Amount
      '000000000000',                          // Total Credit Amount
      '1234567890',                            // Company Identification
      ''.padEnd(19),                           // Message Authentication Code
      ''.padEnd(6),                            // Reserved
      '123456789',                             // Originating DFI Identification
      '0000001'                                // Batch Number
    ].join('');

    return {
      header,
      entries,
      control,
      total_amount: totalAmount,
      entry_count: entries.length
    };
  }

  static async generateCheckFile(batchId: string): Promise<string> {
    // Generate check printing file
    const { data: batchData } = await supabase
      .from('payment_batches')
      .select(`
        *,
        payment_transactions:payment_transactions_enhanced(*)
      `)
      .eq('id', batchId)
      .single();

    if (!batchData) throw new Error('Batch not found');

    // Create CSV format for check printing
    const csvContent = [
      'Check Number,Payee,Amount,Date,Memo',
      ...(batchData.payment_transactions || []).map((payment: any, index: number) => {
        const checkNumber = (1001 + index).toString();
        return [
          checkNumber,
          payment.payee_name || 'Unknown',
          payment.net_amount || 0,
          new Date().toLocaleDateString(),
          payment.description || 'Payment'
        ].join(',');
      })
    ].join('\n');

    const fileName = `checks_${batchData.batch_number}_${new Date().toISOString().split('T')[0]}.csv`;
    const { data: uploadData, error } = await supabase.storage
      .from('financial_documents')
      .upload(`check_files/${fileName}`, csvContent, {
        contentType: 'text/csv'
      });

    if (error) throw error;
    return uploadData.path;
  }

  static async generateWireFile(batchId: string): Promise<string> {
    // Generate wire transfer file
    const { data: batchData } = await supabase
      .from('payment_batches')
      .select(`
        *,
        payment_transactions:payment_transactions_enhanced(*)
      `)
      .eq('id', batchId)
      .single();

    if (!batchData) throw new Error('Batch not found');

    // Create wire transfer format
    const wireContent = (batchData.payment_transactions || []).map((payment: any) => ({
      amount: payment.net_amount,
      beneficiary_name: payment.payee_name,
      beneficiary_account: payment.account_number,
      bank_routing: payment.routing_number,
      reference: payment.reference_number,
      purpose: payment.description
    }));

    const fileName = `wire_${batchData.batch_number}_${new Date().toISOString().split('T')[0]}.json`;
    const { data: uploadData, error } = await supabase.storage
      .from('financial_documents')
      .upload(`wire_files/${fileName}`, JSON.stringify(wireContent, null, 2), {
        contentType: 'application/json'
      });

    if (error) throw error;
    return uploadData.path;
  }

  static async getResidentPaymentMethods(residentId: string): Promise<ResidentPaymentMethod[]> {
    const { data, error } = await supabase
      .from('resident_payment_methods')
      .select('*')
      .eq('resident_id', residentId)
      .eq('is_active', true)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addResidentPaymentMethod(data: {
    resident_id: string;
    payment_type: 'ach' | 'card' | 'bank_transfer';
    account_nickname?: string;
    is_default?: boolean;
    bank_name?: string;
    account_type?: string;
    last_four_digits?: string;
  }): Promise<string> {
    const { data: newMethod, error } = await supabase
      .from('resident_payment_methods')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return newMethod.id;
  }

  static async processAutomaticPayments(associationId: string): Promise<void> {
    // Get all payment plans with auto-pay enabled
    const { data: paymentPlans } = await supabase
      .from('payment_plans')
      .select(`
        *,
        payment_method:resident_payment_methods(*),
        property:properties(*),
        resident:residents(*)
      `)
      .eq('association_id', associationId)
      .eq('auto_pay_enabled', true)
      .eq('plan_status', 'active')
      .lte('next_payment_date', new Date().toISOString().split('T')[0]);

    if (!paymentPlans) return;

    // Process each auto-payment
    for (const plan of paymentPlans) {
      try {
        await this.processAutomaticPayment(plan);
      } catch (error) {
        console.error(`Failed to process auto-payment for plan ${plan.id}:`, error);
        // Continue with other payments
      }
    }
  }

  private static async processAutomaticPayment(plan: any): Promise<void> {
    // Create payment transaction
    const { data: { user } } = await supabase.auth.getUser();
    
    const paymentData = {
      association_id: plan.association_id,
      property_id: plan.property_id,
      resident_id: plan.resident_id,
      payment_type: 'auto_payment',
      gross_amount: plan.monthly_payment,
      net_amount: plan.monthly_payment,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: plan.payment_method?.payment_type || 'ach',
      reference_number: `AUTO-${plan.id}-${Date.now()}`,
      description: `Auto payment for plan ${plan.plan_name}`,
      created_by: user?.id
    };

    const { error: paymentError } = await supabase
      .from('payment_transactions_enhanced')
      .insert(paymentData);

    if (paymentError) throw paymentError;

    // Update payment plan
    const nextPaymentDate = new Date(plan.next_payment_date);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    
    const remainingBalance = plan.remaining_balance - plan.monthly_payment;
    const planStatus = remainingBalance <= 0 ? 'completed' : 'active';

    await supabase
      .from('payment_plans')
      .update({
        remaining_balance: Math.max(0, remainingBalance),
        next_payment_date: nextPaymentDate.toISOString().split('T')[0],
        plan_status: planStatus
      })
      .eq('id', plan.id);
  }

  private static async generateBatchNumber(batchType: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = batchType.toUpperCase();
    const dateString = `${year}${month}${day}`;
    
    // Get the latest batch number for this type and date
    const { data } = await supabase
      .from('payment_batches')
      .select('batch_number')
      .like('batch_number', `${prefix}-${dateString}-%`)
      .order('batch_number', { ascending: false })
      .limit(1);

    let sequenceNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].batch_number.split('-').pop();
      if (lastNumber) {
        sequenceNumber = parseInt(lastNumber) + 1;
      }
    }

    return `${prefix}-${dateString}-${String(sequenceNumber).padStart(3, '0')}`;
  }
}