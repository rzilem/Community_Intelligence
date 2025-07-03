import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type PaymentBatch = Database['public']['Tables']['payment_batches']['Row'];
type PaymentBatchInsert = Database['public']['Tables']['payment_batches']['Insert'];
type PaymentTransaction = Database['public']['Tables']['payment_transactions_enhanced']['Row'];
type ResidentPaymentMethod = Database['public']['Tables']['resident_payment_methods']['Row'];

export interface CreatePaymentBatchData {
  association_id: string;
  payment_method: 'ach' | 'check' | 'wire';
  payment_count: number;
  total_amount: number;
  batch_date: string;
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

    const batchNumber = await this.generateBatchNumber(data.payment_method);
    
    const batchData: PaymentBatchInsert = {
      association_id: data.association_id,
      batch_number: batchNumber,
      payment_method: data.payment_method,
      status: 'draft',
      total_amount: data.total_amount,
      total_count: data.payment_count,
      batch_date: data.batch_date,
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

    // Generate appropriate file based on payment method
    let filePath: string;
    if (batch.payment_method === 'ach') {
      filePath = await this.generateACHFile(batchId);
    } else if (batch.payment_method === 'check') {
      filePath = await this.generateCheckFile(batchId);
    } else {
      filePath = await this.generateWireFile(batchId);
    }

    // Update batch status
    const { error: updateError } = await supabase
      .from('payment_batches')
      .update({
        status: 'processed',
        processed_date: new Date().toISOString(),
        file_generated: true,
        ach_file_path: filePath
      })
      .eq('id', batchId);

    if (updateError) throw updateError;
  }

  static async generateACHFile(batchId: string): Promise<string> {
    // Get batch data
    const { data: batchData, error: batchError } = await supabase
      .from('payment_batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (batchError) throw batchError;
    if (!batchData) throw new Error('Batch not found');

    // Generate ACH file content (simplified for now)
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

    // Entry Detail Records (Record Type 6) - simplified for demo
    const entries: string[] = [];
    let totalAmount = batchData.total_amount || 0;

    // Generate sample entries based on batch amount
    for (let i = 0; i < (batchData.total_count || 1); i++) {
      const entry = [
        '6',                                    // Record Type Code
        '22',                                   // Transaction Code (Checking Credit)
        '123456789',                           // Receiving DFI Identification
        '00000000000000000',                   // DFI Account Number (placeholder)
        Math.floor(totalAmount / (batchData.total_count || 1)).toString().replace('.', '').padStart(10, '0'), // Amount
        ''.padEnd(15),                         // Individual Identification
        ''.padEnd(22),                         // Individual Name
        '0',                                    // Discretionary Data
        '0'                                     // Addenda Record Indicator
      ].join('');
      
      entries.push(entry);
    }

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
    const { data: batchData, error } = await supabase
      .from('payment_batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (error) throw error;
    if (!batchData) throw new Error('Batch not found');

    // Create CSV format for check printing
    const csvContent = [
      'Check Number,Payee,Amount,Date,Memo',
      ...Array.from({ length: batchData.total_count || 1 }, (_, index) => {
        const checkNumber = (1001 + index).toString();
        return [
          checkNumber,
          'Payee Name',
          (batchData.total_amount || 0) / (batchData.total_count || 1),
          new Date().toLocaleDateString(),
          'Payment'
        ].join(',');
      })
    ].join('\n');

    const fileName = `checks_${batchData.batch_number}_${new Date().toISOString().split('T')[0]}.csv`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('financial_documents')
      .upload(`check_files/${fileName}`, csvContent, {
        contentType: 'text/csv'
      });

    if (uploadError) throw uploadError;
    return uploadData.path;
  }

  static async generateWireFile(batchId: string): Promise<string> {
    // Generate wire transfer file
    const { data: batchData, error } = await supabase
      .from('payment_batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (error) throw error;
    if (!batchData) throw new Error('Batch not found');

    // Create wire transfer format
    const wireContent = Array.from({ length: batchData.total_count || 1 }, (_, index) => ({
      amount: (batchData.total_amount || 0) / (batchData.total_count || 1),
      beneficiary_name: `Beneficiary ${index + 1}`,
      beneficiary_account: '0000000000',
      bank_routing: '123456789',
      reference: `WIRE-${batchData.batch_number}-${index + 1}`,
      purpose: 'Payment'
    }));

    const fileName = `wire_${batchData.batch_number}_${new Date().toISOString().split('T')[0]}.json`;
    const { data: uploadData, error: wireUploadError } = await supabase.storage
      .from('financial_documents')
      .upload(`wire_files/${fileName}`, JSON.stringify(wireContent, null, 2), {
        contentType: 'application/json'
      });

    if (wireUploadError) throw wireUploadError;
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
    // This method will be implemented when payment_plans table is available
    console.log(`Processing automatic payments for association ${associationId}`);
    // TODO: Implement when payment_plans and payment_transactions_enhanced tables are properly set up
  }

  static async processBatch(batchId: string): Promise<void> {
    return this.processPaymentBatch(batchId);
  }

  static async getPaymentHistory(residentId: string): Promise<PaymentTransaction[]> {
    const { data, error } = await supabase
      .from('payment_transactions_enhanced')
      .select('*')
      .eq('resident_id', residentId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getAutoPaySettings(residentId: string): Promise<any> {
    const { data, error } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('resident_id', residentId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async addPaymentMethod(data: {
    resident_id: string;
    payment_type: 'ach' | 'card' | 'bank_transfer';
    account_nickname?: string;
    is_default?: boolean;
    bank_name?: string;
    account_type?: string;
    last_four_digits?: string;
  }): Promise<string> {
    return this.addResidentPaymentMethod(data);
  }

  static async deletePaymentMethod(methodId: string): Promise<void> {
    const { error } = await supabase
      .from('resident_payment_methods')
      .update({ is_active: false })
      .eq('id', methodId);

    if (error) throw error;
  }

  static async updateAutoPaySettings(residentId: string, settings: any): Promise<void> {
    const { error } = await supabase
      .from('payment_plans')
      .upsert({
        resident_id: residentId,
        ...settings,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  static async generatePaymentReceipt(paymentId: string): Promise<string> {
    const { data: payment, error } = await supabase
      .from('payment_transactions_enhanced')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) throw error;

    // Generate receipt content
    const receiptContent = {
      payment_id: payment.id,
      amount: payment.net_amount,
      date: payment.payment_date,
      method: payment.payment_method,
      reference: payment.reference_number
    };

    // Store receipt in storage
    const fileName = `receipt_${payment.reference_number}.json`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('financial_documents')
      .upload(`receipts/${fileName}`, JSON.stringify(receiptContent, null, 2), {
        contentType: 'application/json'
      });

    if (uploadError) throw uploadError;
    return uploadData.path;
  }

  private static async generateBatchNumber(paymentMethod: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = paymentMethod.toUpperCase();
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