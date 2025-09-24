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
    const batchNumber = await this.generateBatchNumber(data.payment_method);
    
    console.log('Mock: Creating payment batch', {
      ...data,
      batch_number: batchNumber
    });

    return crypto.randomUUID();
  }

  static async getPaymentBatches(associationId: string): Promise<any[]> {
    return [
      {
        id: '1',
        association_id: associationId,
        batch_number: 'ACH-20240101-001',
        payment_method: 'ach',
        status: 'processed',
        total_amount: 5000,
        total_count: 10,
        batch_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      }
    ];
  }

  static async processPaymentBatch(batchId: string): Promise<void> {
    console.log('Mock: Processing payment batch:', batchId);
  }

  static async generateACHFile(batchId: string): Promise<string> {
    console.log('Mock: Generating ACH file for batch:', batchId);
    return 'mock/ach/file/path.txt';
  }

  static async generateCheckFile(batchId: string): Promise<string> {
    console.log('Mock: Generating check file for batch:', batchId);
    return 'mock/check/file/path.csv';
  }

  static async generateWireFile(batchId: string): Promise<string> {
    console.log('Mock: Generating wire file for batch:', batchId);
    return 'mock/wire/file/path.json';
  }

  static async getResidentPaymentMethods(residentId: string): Promise<any[]> {
    return [
      {
        id: '1',
        resident_id: residentId,
        payment_type: 'ach',
        account_nickname: 'Primary Checking',
        is_default: true,
        bank_name: 'Mock Bank',
        account_type: 'checking',
        last_four_digits: '1234',
        is_active: true
      }
    ];
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
    console.log('Mock: Adding payment method:', data);
    return crypto.randomUUID();
  }

  static async processAutomaticPayments(associationId: string): Promise<void> {
    console.log(`Mock: Processing automatic payments for association ${associationId}`);
  }

  static async processBatch(batchId: string): Promise<void> {
    return this.processPaymentBatch(batchId);
  }

  static async getPaymentHistory(residentId: string): Promise<any[]> {
    return [
      {
        id: '1',
        resident_id: residentId,
        net_amount: 150.00,
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: 'PAY-001',
        status: 'completed'
      }
    ];
  }

  static async getAutoPaySettings(residentId: string): Promise<any> {
    return {
      id: '1',
      resident_id: residentId,
      is_active: true,
      payment_method_id: '1',
      auto_pay_amount: 150.00
    };
  }

  static async addPaymentMethod(data: any): Promise<any> {
    return {
      id: crypto.randomUUID(),
      ...data,
      is_active: true,
      created_at: new Date().toISOString()
    };
  }

  static async deletePaymentMethod(methodId: string): Promise<void> {
    console.log('Mock: Deleting payment method:', methodId);
  }

  static async updateAutoPaySettings(residentId: string, settings: any): Promise<void> {
    console.log('Mock: Updating auto-pay settings:', residentId, settings);
  }

  static async generatePaymentReceipt(paymentId: string): Promise<string> {
    console.log('Mock: Generating payment receipt for:', paymentId);
    return 'mock/receipt/path.json';
  }

  private static async generateBatchNumber(paymentMethod: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = paymentMethod.toUpperCase();
    const dateString = `${year}${month}${day}`;
    const sequenceNumber = 1;

    return `${prefix}-${dateString}-${String(sequenceNumber).padStart(3, '0')}`;
  }
}