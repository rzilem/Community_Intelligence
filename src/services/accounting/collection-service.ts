import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type CollectionCase = Database['public']['Tables']['collection_cases']['Row'];
type CollectionCaseInsert = Database['public']['Tables']['collection_cases']['Insert'];

export interface CreateCollectionCaseData {
  association_id: string;
  property_id: string;
  resident_id?: string;
  total_amount_owed: number;
  original_balance: number;
  collection_stage: 'notice' | 'demand' | 'legal' | 'closed';
}

export interface CollectionWorkflowStep {
  step_type: 'notice' | 'demand_letter' | 'phone_call' | 'legal_action';
  days_from_due: number;
  template_id?: string;
  auto_execute: boolean;
  escalation_trigger?: {
    amount_threshold?: number;
    days_overdue?: number;
  };
}

export interface CollectionRule {
  id: string;
  association_id: string;
  rule_name: string;
  trigger_conditions: {
    amount_threshold: number;
    days_overdue: number;
    assessment_types?: string[];
  };
  workflow_steps: CollectionWorkflowStep[];
  is_active: boolean;
}

export class CollectionService {
  
  static async getCollectionCases(associationId: string): Promise<CollectionCase[]> {
    const { data, error } = await supabase
      .from('collection_cases')
      .select(`
        *,
        property:properties(*),
        resident:residents(*)
      `)
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createCollectionCase(data: CreateCollectionCaseData): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const caseNumber = await this.generateCaseNumber();
    
    const caseData: CollectionCaseInsert = {
      association_id: data.association_id,
      property_id: data.property_id,
      resident_id: data.resident_id,
      case_number: caseNumber,
      case_status: 'open',
      total_amount_owed: data.total_amount_owed,
      original_balance: data.original_balance,
      collection_stage: data.collection_stage,
      next_action_date: this.calculateNextActionDate(data.collection_stage),
      created_by: user.id,
      assigned_to: user.id
    };

    const { data: newCase, error } = await supabase
      .from('collection_cases')
      .insert(caseData)
      .select()
      .single();

    if (error) throw error;
    return newCase.id;
  }

  static async processAutomaticCollections(associationId: string): Promise<void> {
    // Find all overdue accounts receivable
    const { data: overdueAR } = await supabase
      .from('accounts_receivable')
      .select(`
        *,
        property:properties(*),
        residents:residents(*)
      `)
      .eq('association_id', associationId)
      .eq('status', 'open')
      .lt('due_date', new Date().toISOString().split('T')[0]);

    if (!overdueAR) return;

    // Group by property for collection case creation
    const overdueByProperty = this.groupByProperty(overdueAR);

    // Process each property
    for (const [propertyId, arItems] of Object.entries(overdueByProperty)) {
      await this.processPropertyForCollections(associationId, propertyId, arItems);
    }
  }

  private static groupByProperty(arItems: any[]): Record<string, any[]> {
    return arItems.reduce((acc, item) => {
      if (!acc[item.property_id]) {
        acc[item.property_id] = [];
      }
      acc[item.property_id].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private static async processPropertyForCollections(
    associationId: string,
    propertyId: string,
    arItems: any[]
  ): Promise<void> {
    const totalOwed = arItems.reduce((sum, item) => sum + item.current_balance, 0);
    const oldestDueDate = arItems
      .map(item => new Date(item.due_date))
      .sort((a, b) => a.getTime() - b.getTime())[0];
    
    const daysOverdue = Math.floor((Date.now() - oldestDueDate.getTime()) / (1000 * 60 * 60 * 24));

    // Check if case already exists
    const { data: existingCase } = await supabase
      .from('collection_cases')
      .select('*')
      .eq('association_id', associationId)
      .eq('property_id', propertyId)
      .eq('case_status', 'open')
      .single();

    if (existingCase) {
      // Update existing case
      await this.updateCollectionCase(existingCase.id, {
        total_amount_owed: totalOwed,
        collection_stage: this.determineCollectionStage(daysOverdue, totalOwed),
        next_action_date: this.calculateNextActionDate(
          this.determineCollectionStage(daysOverdue, totalOwed)
        )
      });
    } else {
      // Create new case if amount meets threshold
      if (totalOwed >= 100 && daysOverdue >= 30) { // Configurable thresholds
        await this.createCollectionCase({
          association_id: associationId,
          property_id: propertyId,
          resident_id: arItems[0].residents?.[0]?.id,
          total_amount_owed: totalOwed,
          original_balance: totalOwed,
          collection_stage: this.determineCollectionStage(daysOverdue, totalOwed)
        });
      }
    }
  }

  private static determineCollectionStage(daysOverdue: number, amount: number): 'notice' | 'demand' | 'legal' | 'closed' {
    if (daysOverdue >= 90 || amount >= 5000) {
      return 'legal';
    } else if (daysOverdue >= 60) {
      return 'demand';
    } else {
      return 'notice';
    }
  }

  private static calculateNextActionDate(stage: string): string {
    const now = new Date();
    let daysToAdd = 7; // Default 1 week

    switch (stage) {
      case 'notice':
        daysToAdd = 14; // 2 weeks for initial notice
        break;
      case 'demand':
        daysToAdd = 10; // 10 days for demand letter
        break;
      case 'legal':
        daysToAdd = 30; // 30 days for legal action
        break;
    }

    now.setDate(now.getDate() + daysToAdd);
    return now.toISOString().split('T')[0];
  }

  static async updateCollectionCase(caseId: string, updates: Partial<CollectionCase>): Promise<void> {
    const { error } = await supabase
      .from('collection_cases')
      .update(updates)
      .eq('id', caseId);

    if (error) throw error;
  }

  static async escalateCollectionCase(caseId: string, newStage: string, notes?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updates = {
      collection_stage: newStage,
      escalation_date: new Date().toISOString(),
      last_contact_date: new Date().toISOString().split('T')[0],
      next_action_date: this.calculateNextActionDate(newStage),
      notes: notes
    };

    await this.updateCollectionCase(caseId, updates);

    // Log the escalation activity
    await this.logCollectionActivity(caseId, 'escalation', `Escalated to ${newStage}`, user.id);
  }

  static async assignAttorney(caseId: string, attorneyName: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    await this.updateCollectionCase(caseId, {
      attorney_assigned: attorneyName,
      collection_stage: 'legal',
      escalation_date: new Date().toISOString()
    });

    await this.logCollectionActivity(caseId, 'attorney_assignment', `Assigned to attorney: ${attorneyName}`, user.id);
  }

  static async recordSettlement(
    caseId: string, 
    settlementAmount: number, 
    notes?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    await this.updateCollectionCase(caseId, {
      settlement_amount: settlementAmount,
      case_status: 'settled',
      notes: notes
    });

    await this.logCollectionActivity(
      caseId, 
      'settlement', 
      `Settlement recorded: $${settlementAmount}`, 
      user.id
    );
  }

  static async closeCollectionCase(caseId: string, reason: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    await this.updateCollectionCase(caseId, {
      case_status: 'closed',
      collection_stage: 'closed',
      notes: reason
    });

    await this.logCollectionActivity(caseId, 'closure', `Case closed: ${reason}`, user.id);
  }

  private static async logCollectionActivity(
    caseId: string,
    activityType: string,
    description: string,
    userId: string
  ): Promise<void> {
    // This would log to a collection_activities table if it existed
    // For now, we'll just log to console
    console.log(`Collection Activity - Case: ${caseId}, Type: ${activityType}, User: ${userId}, Description: ${description}`);
  }

  static async getCollectionStatistics(associationId: string) {
    const { data: cases } = await supabase
      .from('collection_cases')
      .select('*')
      .eq('association_id', associationId);

    if (!cases) return null;

    const totalCases = cases.length;
    const openCases = cases.filter(c => c.case_status === 'open').length;
    const totalAmountInCollections = cases
      .filter(c => c.case_status === 'open')
      .reduce((sum, c) => sum + (c.total_amount_owed || 0), 0);

    const casesByStage = cases.reduce((acc, c) => {
      if (!acc[c.collection_stage]) acc[c.collection_stage] = 0;
      acc[c.collection_stage]++;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_cases: totalCases,
      open_cases: openCases,
      closed_cases: totalCases - openCases,
      total_amount_in_collections: totalAmountInCollections,
      cases_by_stage: casesByStage,
      success_rate: totalCases > 0 ? ((totalCases - openCases) / totalCases) * 100 : 0
    };
  }

  private static async generateCaseNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const { data } = await supabase
      .from('collection_cases')
      .select('case_number')
      .like('case_number', `COLL-${year}${month}-%`)
      .order('case_number', { ascending: false })
      .limit(1);

    let sequenceNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].case_number.split('-').pop();
      if (lastNumber) {
        sequenceNumber = parseInt(lastNumber) + 1;
      }
    }

    return `COLL-${year}${month}-${String(sequenceNumber).padStart(4, '0')}`;
  }
}