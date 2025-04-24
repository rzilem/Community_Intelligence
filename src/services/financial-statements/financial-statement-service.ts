
import { supabase } from '@/integrations/supabase/client';

export type StatementType = 'income' | 'balance_sheet' | 'cash_flow';

export interface FinancialStatementParams {
  associationId: string;
  statementType: StatementType;
  startDate: string;
  endDate: string;
}

export interface FinancialStatement {
  id: string;
  association_id: string;
  statement_type: StatementType;
  period_start: string;
  period_end: string;
  created_at: string;
  created_by: string;
  data: any; // This will vary based on statement type
  metadata?: any;
}

export const financialStatementService = {
  generateStatement: async (params: FinancialStatementParams): Promise<FinancialStatement> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-financial-statement', {
        body: {
          associationId: params.associationId,
          statementType: params.statementType,
          startDate: params.startDate,
          endDate: params.endDate
        }
      });

      if (error) throw new Error(error.message);
      
      return data?.data;
    } catch (error) {
      console.error('Error generating financial statement:', error);
      throw error;
    }
  },

  getStatements: async (associationId: string, statementType?: StatementType) => {
    try {
      let query = supabase
        .from('financial_statements')
        .select('*')
        .eq('association_id', associationId)
        .order('created_at', { ascending: false });

      if (statementType) {
        query = query.eq('statement_type', statementType);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return data as FinancialStatement[];
    } catch (error) {
      console.error('Error fetching financial statements:', error);
      throw error;
    }
  },

  getStatementById: async (statementId: string) => {
    try {
      const { data, error } = await supabase
        .from('financial_statements')
        .select('*')
        .eq('id', statementId)
        .single();

      if (error) throw error;
      
      return data as FinancialStatement;
    } catch (error) {
      console.error('Error fetching financial statement:', error);
      throw error;
    }
  }
};
