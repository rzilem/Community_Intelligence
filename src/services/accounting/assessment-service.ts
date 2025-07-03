import { supabase } from '@/integrations/supabase/client';
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

  // Billing Cycle Management
  static async getBillingCycles(associationId: string): Promise<AssessmentBillingCycle[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_billing_cycles')
        .select('*')
        .eq('association_id', associationId)
        .order('cycle_name');

      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase
        .from('assessment_billing_cycles')
        .insert(cycle)
        .select()
        .single();

      if (error) throw error;

      this.toast({
        title: "Success",
        description: "Billing cycle created successfully",
      });

      return data;
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

  // Automated Billing Generation
  static async generateBillingRun(
    associationId: string,
    billingCycleId: string,
    billingDate: string
  ): Promise<AssessmentBillingRun> {
    try {
      // First, get the billing cycle details
      const { data: cycle, error: cycleError } = await supabase
        .from('assessment_billing_cycles')
        .select('*')
        .eq('id', billingCycleId)
        .single();

      if (cycleError) throw cycleError;

      // Create the billing run record
      const billingRunData = {
        association_id: associationId,
        billing_cycle_id: billingCycleId,
        run_date: billingDate,
        billing_period_start: billingDate,
        billing_period_end: this.calculatePeriodEnd(billingDate, cycle.cycle_type),
        status: 'pending' as const,
        total_assessments_generated: 0,
        total_amount: 0,
      };

      const { data: billingRun, error: runError } = await supabase
        .from('assessment_billing_runs')
        .insert([billingRunData])
        .select()
        .single();

      if (runError) throw runError;

      // Start the billing generation process
      await this.processeBillingRun(billingRun.id);

      return billingRun;
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

  private static async processeBillingRun(billingRunId: string): Promise<void> {
    try {
      // Update status to running
      await supabase
        .from('assessment_billing_runs')
        .update({ status: 'running' })
        .eq('id', billingRunId);

      // Get billing run details
      const { data: billingRun, error } = await supabase
        .from('assessment_billing_runs')
        .select(`
          *,
          assessment_billing_cycles (*)
        `)
        .eq('id', billingRunId)
        .single();

      if (error) throw error;

      // Get all properties for the association
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('association_id', billingRun.association_id);

      if (propertiesError) throw propertiesError;

      let totalAssessments = 0;
      let totalAmount = 0;

      // Generate assessments for each property
      for (const property of properties || []) {
        const assessmentAmount = await this.calculateAssessmentAmount(
          property.id,
          []
        );

        if (assessmentAmount > 0) {
          const assessmentData = {
            property_id: property.id,
            amount: assessmentAmount,
            due_date: this.calculateDueDate(
              billingRun.run_date,
              billingRun.assessment_billing_cycles.due_day
            ),
            payment_status: 'unpaid',
            billing_run_id: billingRunId,
          };

          const { error: assessmentError } = await supabase
            .from('accounts_receivable')
            .insert([{
              property_id: property.id,
              association_id: billingRun.association_id,
              invoice_type: 'assessment',
              invoice_date: billingRun.run_date,
              due_date: assessmentData.due_date,
              original_amount: assessmentAmount,
              current_balance: assessmentAmount,
              status: 'open',
            }]);

          if (!assessmentError) {
            totalAssessments++;
            totalAmount += assessmentAmount;
          }
        }
      }

      // Update billing run with results
      await supabase
        .from('assessment_billing_runs')
        .update({
          status: 'completed',
          total_assessments_generated: totalAssessments,
          total_amount: totalAmount,
        })
        .eq('id', billingRunId);

      this.toast({
        title: "Success",
        description: `Generated ${totalAssessments} assessments totaling $${totalAmount.toFixed(2)}`,
      });

    } catch (error) {
      console.error('Error processing billing run:', error);
      await supabase
        .from('assessment_billing_runs')
        .update({
          status: 'failed',
          error_details: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', billingRunId);
    }
  }

  // Late Fee Calculation Engine
  static async calculateLateFees(associationId: string): Promise<LateFeeCalculation[]> {
    try {
      // Get all overdue assessments
      const { data: overdueAssessments, error } = await supabase
        .from('accounts_receivable')
        .select(`
          *,
          properties (association_id)
        `)
        .eq('properties.association_id', associationId)
        .eq('status', 'open')
        .lt('due_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      const lateFeeCalculations: LateFeeCalculation[] = [];

      for (const assessment of overdueAssessments || []) {
        const daysLate = this.calculateDaysLate(assessment.due_date);
        const lateFee = await this.calculateLateFeeAmount(
          assessment.id,
          assessment.original_amount,
          daysLate
        );

        if (lateFee > 0) {
          lateFeeCalculations.push({
            assessment_id: assessment.id,
            base_amount: assessment.original_amount,
            days_late: daysLate,
            late_fee_amount: lateFee,
            late_fee_type: 'percentage', // This would come from settings
            compound_interest: false,
            calculation_date: new Date().toISOString(),
          });
        }
      }

      return lateFeeCalculations;
    } catch (error) {
      console.error('Error calculating late fees:', error);
      throw error;
    }
  }

  private static calculateDaysLate(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static async calculateLateFeeAmount(
    assessmentId: string,
    baseAmount: number,
    daysLate: number
  ): Promise<number> {
    // In a real implementation, this would get the late fee settings
    // from the association or assessment type configuration
    const lateFeePercentage = 0.05; // 5% late fee
    const gracePeriod = 10; // 10 days grace period

    if (daysLate <= gracePeriod) return 0;

    return baseAmount * lateFeePercentage;
  }

  // Payment Application Logic
  static async applyPayment(
    propertyId: string,
    paymentAmount: number,
    paymentMethod: string,
    referenceNumber?: string
  ): Promise<AssessmentPayment> {
    try {
      // Create the payment record
      const paymentData = {
        property_id: propertyId,
        payment_date: new Date().toISOString(),
        amount_paid: paymentAmount,
        payment_method: paymentMethod as any,
        reference_number: referenceNumber,
      };

      // For now, create a mock payment since assessment_payments table doesn't exist
      const payment = {
        id: crypto.randomUUID(),
        assessment_id: 'mock-assessment-id',
        ...paymentData,
        created_at: new Date().toISOString(),
      };

      // Apply payment to outstanding assessments (oldest first)
      await this.allocatePaymentToAssessments(payment.id, propertyId, paymentAmount);

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

  private static async allocatePaymentToAssessments(
    paymentId: string,
    propertyId: string,
    paymentAmount: number
  ): Promise<void> {
    try {
      // Get outstanding assessments for the property (oldest first)
      const { data: assessments, error } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'open')
        .gt('current_balance', 0)
        .order('due_date', { ascending: true });

      if (error) throw error;

      let remainingPayment = paymentAmount;
      const allocations: Partial<PaymentAllocation>[] = [];

      for (const assessment of assessments || []) {
        if (remainingPayment <= 0) break;

        const allocationAmount = Math.min(remainingPayment, assessment.current_balance);

        // Create allocation record
        allocations.push({
          payment_id: paymentId,
          assessment_id: assessment.id,
          allocated_amount: allocationAmount,
          allocation_type: 'automatic',
        });

        // Update assessment balance
        const newBalance = assessment.current_balance - allocationAmount;
        const newStatus = newBalance === 0 ? 'paid' : 'partial';

        await supabase
          .from('accounts_receivable')
          .update({
            current_balance: newBalance,
            paid_amount: (assessment.paid_amount || 0) + allocationAmount,
            status: newStatus,
          })
          .eq('id', assessment.id);

        remainingPayment -= allocationAmount;
      }

      // Insert all allocations - would use payment_allocations table when it exists
      if (allocations.length > 0) {
        console.log('Payment allocations:', allocations);
      }

      // If there's remaining payment, create a credit balance
      if (remainingPayment > 0) {
        await this.createCreditBalance(propertyId, remainingPayment);
      }
    } catch (error) {
      console.error('Error allocating payment:', error);
      throw error;
    }
  }

  private static async createCreditBalance(propertyId: string, amount: number): Promise<void> {
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('association_id')
      .eq('id', propertyId)
      .single();

    if (propertyError) throw propertyError;

    await supabase
      .from('account_credits')
      .insert([{
        property_id: propertyId,
        association_id: property.association_id,
        credit_type: 'overpayment',
        amount,
        remaining_balance: amount,
        credit_date: new Date().toISOString().split('T')[0],
        description: `Overpayment credit from payment application`,
        status: 'active',
      }]);
  }

  // Utility Methods
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
    start.setDate(start.getDate() - 1); // Last day of period
    return start.toISOString().split('T')[0];
  }

  private static calculateDueDate(billingDate: string, dueDays: number): string {
    const billing = new Date(billingDate);
    billing.setDate(billing.getDate() + dueDays);
    return billing.toISOString().split('T')[0];
  }

  private static async calculateAssessmentAmount(
    propertyId: string,
    assessmentTypes: string[]
  ): Promise<number> {
    // In a real implementation, this would calculate based on
    // property specifics and assessment type configurations
    // For now, return a mock amount
    return 250.00; // Standard monthly assessment
  }

  // Aging Report
  static async getAgingReport(associationId: string): Promise<{
    current: number;
    days31_60: number;
    days61_90: number;
    days91_120: number;
    over120: number;
  }> {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      const onetwentyDaysAgo = new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('current_balance, due_date')
        .eq('association_id', associationId)
        .eq('status', 'open')
        .gt('current_balance', 0);

      if (error) throw error;

      const aging = {
        current: 0,
        days31_60: 0,
        days61_90: 0,
        days91_120: 0,
        over120: 0,
      };

      for (const record of data || []) {
        const dueDate = new Date(record.due_date);
        
        if (dueDate >= thirtyDaysAgo) {
          aging.current += record.current_balance;
        } else if (dueDate >= sixtyDaysAgo) {
          aging.days31_60 += record.current_balance;
        } else if (dueDate >= ninetyDaysAgo) {
          aging.days61_90 += record.current_balance;
        } else if (dueDate >= onetwentyDaysAgo) {
          aging.days91_120 += record.current_balance;
        } else {
          aging.over120 += record.current_balance;
        }
      }

      return aging;
    } catch (error) {
      console.error('Error generating aging report:', error);
      throw error;
    }
  }
}