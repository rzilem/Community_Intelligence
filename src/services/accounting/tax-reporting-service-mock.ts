export interface Vendor1099Record {
  id: string;
  association_id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_tin: string;
  tax_year: number;
  total_amount: number;
  box_1_rents: number;
  box_3_other_income: number;
  box_7_nonemployee_compensation: number;
  form_type: '1099-MISC' | '1099-NEC';
  status: 'pending' | 'generated' | 'submitted';
  created_at: string;
  updated_at: string;
}

export interface TaxYearSummary {
  year: number;
  status: 'pending' | 'submitted';
  total_vendors: number;
  total_amount: number;
  forms_generated: number;
  deadline: string;
}

export class TaxReportingService {
  // Mock 1099 records
  private static mock1099Records: Vendor1099Record[] = [
    {
      id: '1',
      association_id: 'default-hoa',
      vendor_id: 'vendor-1',
      vendor_name: 'Green Thumb Landscaping',
      vendor_tin: '12-3456789',
      tax_year: 2024,
      total_amount: 15000,
      box_1_rents: 0,
      box_3_other_income: 0,
      box_7_nonemployee_compensation: 15000,
      form_type: '1099-NEC',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      association_id: 'default-hoa',
      vendor_id: 'vendor-2',
      vendor_name: 'Reliable Plumbing Services',
      vendor_tin: '98-7654321',
      tax_year: 2024,
      total_amount: 8500,
      box_1_rents: 0,
      box_3_other_income: 0,
      box_7_nonemployee_compensation: 8500,
      form_type: '1099-NEC',
      status: 'generated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  static async get1099Records(associationId: string, taxYear: number): Promise<Vendor1099Record[]> {
    return this.mock1099Records.filter(record => 
      record.association_id === associationId && record.tax_year === taxYear
    );
  }

  static async getTaxYearSummary(associationId: string): Promise<TaxYearSummary[]> {
    return [
      {
        year: 2023,
        status: 'submitted',
        total_vendors: 15,
        total_amount: 125000,
        forms_generated: 12,
        deadline: '2024-01-31'
      },
      {
        year: 2024,
        status: 'pending',
        total_vendors: 18,
        total_amount: 150000,
        forms_generated: 8,
        deadline: '2025-01-31'
      }
    ];
  }

  static async generate1099Forms(associationId: string, taxYear: number): Promise<{ success: boolean; formsGenerated: number }> {
    // Simulate form generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update mock records to "generated" status
    this.mock1099Records.forEach(record => {
      if (record.association_id === associationId && record.tax_year === taxYear) {
        record.status = 'generated';
        record.updated_at = new Date().toISOString();
      }
    });

    return { 
      success: true, 
      formsGenerated: this.mock1099Records.filter(r => 
        r.association_id === associationId && r.tax_year === taxYear
      ).length 
    };
  }

  static async download1099Form(recordId: string): Promise<Uint8Array> {
    // Return mock PDF data
    await new Promise(resolve => setTimeout(resolve, 500));
    return new Uint8Array([]);
  }

  static async downloadBulk1099s(associationId: string, taxYear: number): Promise<Uint8Array> {
    // Return mock ZIP data
    await new Promise(resolve => setTimeout(resolve, 1000));
    return new Uint8Array([]);
  }

  static async submitToIRS(associationId: string, taxYear: number): Promise<{ success: boolean; confirmationNumber: string }> {
    // Simulate IRS submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update mock records to "submitted" status
    this.mock1099Records.forEach(record => {
      if (record.association_id === associationId && record.tax_year === taxYear) {
        record.status = 'submitted';
        record.updated_at = new Date().toISOString();
      }
    });

    return { 
      success: true, 
      confirmationNumber: `IRS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}` 
    };
  }

  static async create1099Record(recordData: Partial<Vendor1099Record>): Promise<string> {
    const newRecord: Vendor1099Record = {
      id: crypto.randomUUID(),
      association_id: recordData.association_id || '',
      vendor_id: recordData.vendor_id || '',
      vendor_name: recordData.vendor_name || '',
      vendor_tin: recordData.vendor_tin || '',
      tax_year: recordData.tax_year || new Date().getFullYear(),
      total_amount: recordData.total_amount || 0,
      box_1_rents: recordData.box_1_rents || 0,
      box_3_other_income: recordData.box_3_other_income || 0,
      box_7_nonemployee_compensation: recordData.box_7_nonemployee_compensation || 0,
      form_type: recordData.form_type || '1099-NEC',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mock1099Records.push(newRecord);
    return newRecord.id;
  }

  static async update1099Record(recordId: string, updates: Partial<Vendor1099Record>): Promise<void> {
    const index = this.mock1099Records.findIndex(r => r.id === recordId);
    if (index !== -1) {
      this.mock1099Records[index] = {
        ...this.mock1099Records[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
    }
  }

  static async delete1099Record(recordId: string): Promise<void> {
    const index = this.mock1099Records.findIndex(r => r.id === recordId);
    if (index !== -1) {
      this.mock1099Records.splice(index, 1);
    }
  }
}