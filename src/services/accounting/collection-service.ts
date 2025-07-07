import { supabase } from '@/integrations/supabase/client';

export interface CreateCollectionCaseData {
  association_id: string;
  property_id: string;
  total_amount_owed: number;
  notes?: string;
}

export interface CreateCollectionActionData {
  case_id: string;
  action_type: string;
  description: string;
  amount?: number;
  outcome?: string;
}

export class CollectionService {
  
  static async getCollectionCases(associationId: string) {
    const { data, error } = await supabase
      .from('collection_cases')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createCollectionCase(data: CreateCollectionCaseData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const caseNumber = await this.generateCaseNumber(data.association_id);
    
    const caseData = {
      association_id: data.association_id,
      property_id: data.property_id,
      case_number: caseNumber,
      total_amount_owed: data.total_amount_owed,
      current_balance: data.total_amount_owed,
      case_status: 'open',
      collection_stage: 'initial',
      original_balance: data.total_amount_owed,
    };

    const { data: newCase, error } = await supabase
      .from('collection_cases')
      .insert(caseData)
      .select()
      .single();

    if (error) throw error;
    return newCase;
  }

  static async updateCaseStatus(caseId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('collection_cases')
      .update({ 
        case_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId);

    if (error) throw error;
  }

  static async addCollectionAction(data: CreateCollectionActionData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const actionData = {
      case_id: data.case_id,
      action_type: data.action_type,
      description: data.description,
      amount: data.amount,
      outcome: data.outcome,
      scheduled_date: new Date().toISOString().split('T')[0],
      status: 'completed',
      performed_by: user.id
    };

    const { data: newAction, error } = await supabase
      .from('collection_actions')
      .insert(actionData)
      .select()
      .single();

    if (error) throw error;
    return newAction;
  }

  static async getCollectionActions(associationId: string) {
    const { data, error } = await supabase
      .from('collection_actions')
      .select(`
        *,
        collection_case:collection_cases!inner(association_id)
      `)
      .eq('collection_case.association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(item => ({
      ...item,
      collection_case: undefined
    })) || [];
  }

  private static async generateCaseNumber(associationId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const prefix = `COL-${year}${month}`;
    
    const { data } = await supabase
      .from('collection_cases')
      .select('case_number')
      .eq('association_id', associationId)
      .like('case_number', `${prefix}-%`)
      .order('case_number', { ascending: false })
      .limit(1);

    let sequenceNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].case_number.split('-').pop();
      if (lastNumber) {
        sequenceNumber = parseInt(lastNumber) + 1;
      }
    }

    return `${prefix}-${String(sequenceNumber).padStart(4, '0')}`;
  }
}