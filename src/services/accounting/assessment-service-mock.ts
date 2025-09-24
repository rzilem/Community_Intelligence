import { useToast } from '@/hooks/use-toast';

export interface AssessmentBillingCycle {
  id: string;
  association_id: string;
  cycle_name: string;
  cycle_type: string;
  billing_day: number;
  due_day: number;
  grace_period_days: number;
  late_fee_day?: number;
  assessment_types: any;
  auto_generate: boolean;
  is_active: boolean;
  next_billing_date?: string;
  last_generated_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentBillingRun {
  id: string;
  association_id: string;
  billing_cycle_id: string;
  run_date: string;
  billing_period_start: string;
  billing_period_end: string;
  status: string;
  total_assessments_generated: number;
  total_amount: number;
  error_details?: string;
  created_by?: string;
  created_at: string;
}

export interface AssessmentPayment {
  id: string;
  assessment_id: string;
  property_id: string;
  payment_date: string;
  amount_paid: number;
  payment_method: 'check' | 'ach' | 'credit_card' | 'cash' | 'money_order';
  reference_number?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  assessment_id: string;
  allocated_amount: number;
  allocation_type: 'automatic' | 'manual';
  gl_account_code?: string;
  created_at: string;
}

export interface LateFeeCalculation {
  assessment_id: string;
  base_amount: number;
  days_late: number;
  late_fee_amount: number;
  late_fee_type: 'flat' | 'percentage' | 'daily';
  compound_interest: boolean;
  calculation_date: string;
}

export class AssessmentService {
  private static toast = useToast().toast;

  // Mock Billing Cycle Management
  static async getBillingCycles(associationId: string): Promise<AssessmentBillingCycle[]> {
    try {
      const mockCycles: AssessmentBillingCycle[] = [
        {
          id: '1',
          association_id: associationId,
          cycle_name: 'Monthly Assessments',
          cycle_type: 'monthly',
          billing_day: 1,
          due_day: 30,
          grace_period_days: 10,
          late_fee_day: 40,
          assessment_types: {},
          auto_generate: true,
          is_active: true,
          next_billing_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      return mockCycles;
    } catch (error) {
      console.error('Error fetching billing cycles:', error);
      this.toast({
        title: "Error",
        description: "Failed to fetch billing cycles",
        variant: "destructive",
      });
      throw error;
    }
  }

  static async createBillingCycle(cycle: any): Promise<any> {
    try {
      const mockData = {
        id: crypto.randomUUID(),
        ...cycle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.toast({
        title: "Success",
        description: "Billing cycle created successfully",
      });

      return mockData;
    } catch (error) {
      console.error('Error creating billing cycle:', error);
      this.toast({
        title: "Error",
        description: "Failed to create billing cycle",
        variant: "destructive",
      });
      throw error;
    }
  }

  static async generateBillingRun(
    associationId: string,
    billingCycleId: string,
    billingDate: string
  ): Promise<AssessmentBillingRun> {
    try {
      const mockBillingRun: AssessmentBillingRun = {
        id: crypto.randomUUID(),
        association_id: associationId,
        billing_cycle_id: billingCycleId,
        run_date: billingDate,
        billing_period_start: billingDate,
        billing_period_end: this.calculatePeriodEnd(billingDate, 'monthly'),
        status: 'completed',
        total_assessments_generated: 5,
        total_amount: 2500.00,
        created_at: new Date().toISOString()
      };

      this.toast({
        title: "Success",
        description: `Generated 5 assessments totaling $2,500.00`,
      });

      return mockBillingRun;
    } catch (error) {
      console.error('Error generating billing run:', error);
      this.toast({
        title: "Error",
        description: "Failed to generate billing run",
        variant: "destructive",
      });
      throw error;
    }
  }

  static async calculateLateFees(associationId: string): Promise<LateFeeCalculation[]> {
    try {
      const mockLateFees: LateFeeCalculation[] = [
        {
          assessment_id: 'assessment-1',
          base_amount: 500.00,
          days_late: 15,
          late_fee_amount: 25.00,
          late_fee_type: 'percentage',
          compound_interest: false,
          calculation_date: new Date().toISOString(),
        }
      ];

      return mockLateFees;
    } catch (error) {
      console.error('Error calculating late fees:', error);
      throw error;
    }
  }

  static async applyPayment(
    propertyId: string,
    paymentAmount: number,
    paymentMethod: string,
    referenceNumber?: string
  ): Promise<AssessmentPayment> {
    try {
      const payment: AssessmentPayment = {
        id: crypto.randomUUID(),
        assessment_id: 'mock-assessment-id',
        property_id: propertyId,
        payment_date: new Date().toISOString(),
        amount_paid: paymentAmount,
        payment_method: paymentMethod as any,
        reference_number: referenceNumber,
        created_at: new Date().toISOString(),
      };

      this.toast({
        title: "Success",
        description: "Payment applied successfully",
      });

      return payment;
    } catch (error) {
      console.error('Error applying payment:', error);
      this.toast({
        title: "Error",
        description: "Failed to apply payment",
        variant: "destructive",
      });
      throw error;
    }
  }

  static async getAgingReport(associationId: string): Promise<any[]> {
    try {
      // Mock aging report data
      const mockAgingData = [
        {
          property_id: 'prop-1',
          property_address: '123 Main St',
          current: 500.00,
          days_30: 250.00,
          days_60: 100.00,
          days_90: 50.00,
          over_90: 25.00,
          total_due: 925.00
        }
      ];

      return mockAgingData;
    } catch (error) {
      console.error('Error fetching aging report:', error);
      throw error;
    }
  }

  private static calculatePeriodEnd(startDate: string, cycleType: string): string {
    const start = new Date(startDate);
    switch (cycleType) {
      case 'monthly':
        start.setMonth(start.getMonth() + 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() + 3);
        break;
      case 'bi_annual':
        start.setMonth(start.getMonth() + 6);
        break;
      case 'annual':
        start.setFullYear(start.getFullYear() + 1);
        break;
      default:
        start.setMonth(start.getMonth() + 1);
    }
    start.setDate(start.getDate() - 1);
    return start.toISOString().split('T')[0];
  }
}