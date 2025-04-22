
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { Compliance } from '@/types/compliance-types';
import { toast } from 'sonner';

interface CreateComplianceParams {
  associationId: string;
  propertyId: string;
  residentId?: string;
  violationType: string;
  description?: string;
  dueDate?: string;
  fineAmount?: number;
}

interface UpdateComplianceParams {
  id: string;
  propertyId?: string;
  residentId?: string;
  violationType?: string;
  description?: string;
  status?: 'open' | 'in-progress' | 'resolved' | 'escalated';
  dueDate?: string;
  fineAmount?: number;
  resolvedDate?: string;
}

export function useComplianceManagement() {
  const createComplianceIssue = useMutation({
    mutationFn: async (params: CreateComplianceParams) => {
      try {
        const { data, error } = await supabase
          .from('compliance_issues')
          .insert({
            association_id: params.associationId,
            property_id: params.propertyId,
            resident_id: params.residentId || null,
            violation_type: params.violationType,
            description: params.description || null,
            status: 'open',
            due_date: params.dueDate || null,
            fine_amount: params.fineAmount || null
          })
          .select()
          .single();
          
        if (error) throw error;
        
        toast.success('Compliance issue created successfully');
        return data as Compliance;
      } catch (error: any) {
        toast.error(`Error creating compliance issue: ${error.message}`);
        throw error;
      }
    }
  });

  const updateComplianceIssue = useMutation({
    mutationFn: async (params: UpdateComplianceParams) => {
      try {
        const { id, ...updateData } = params;
        
        const { data, error } = await supabase
          .from('compliance_issues')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        toast.success('Compliance issue updated successfully');
        return data as Compliance;
      } catch (error: any) {
        toast.error(`Error updating compliance issue: ${error.message}`);
        throw error;
      }
    }
  });

  return {
    createComplianceIssue,
    updateComplianceIssue
  };
}
