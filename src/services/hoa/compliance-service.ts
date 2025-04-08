
import { supabase } from '@/integrations/supabase/client';
import { Compliance } from '@/types/app-types';
import { toast } from 'sonner';

export const fetchComplianceIssuesByHOA = async (hoaId: string): Promise<Compliance[]> => {
  const { data, error } = await supabase
    .from('compliance_issues' as any)
    .select('*')
    .eq('association_id', hoaId)
    .order('created_at', { ascending: false });

  if (error) {
    toast.error(`Error fetching compliance issues: ${error.message}`);
    throw new Error(`Error fetching compliance issues: ${error.message}`);
  }

  return (data as any[]).map(issue => ({
    id: issue.id,
    association_id: issue.association_id,
    property_id: issue.property_id,
    resident_id: issue.resident_id,
    violation_type: issue.violation_type,
    description: issue.description,
    status: issue.status,
    fine_amount: issue.fine_amount,
    due_date: issue.due_date,
    resolved_date: issue.resolved_date,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
};

export const fetchComplianceIssuesByProperty = async (propertyId: string): Promise<Compliance[]> => {
  const { data, error } = await supabase
    .from('compliance_issues' as any)
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) {
    toast.error(`Error fetching compliance issues: ${error.message}`);
    throw new Error(`Error fetching compliance issues: ${error.message}`);
  }

  return (data as any[]).map(issue => ({
    id: issue.id,
    association_id: issue.association_id,
    property_id: issue.property_id,
    resident_id: issue.resident_id,
    violation_type: issue.violation_type,
    description: issue.description,
    status: issue.status,
    fine_amount: issue.fine_amount,
    due_date: issue.due_date,
    resolved_date: issue.resolved_date,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
};

export const createComplianceIssue = async (issue: Partial<Compliance>): Promise<Compliance> => {
  const { data, error } = await supabase
    .from('compliance_issues' as any)
    .insert(issue as any)
    .select()
    .single();

  if (error) {
    toast.error(`Error creating compliance issue: ${error.message}`);
    throw new Error(`Error creating compliance issue: ${error.message}`);
  }

  toast.success('Compliance issue created successfully');
  const newIssue = data as any;
  
  return {
    id: newIssue.id,
    association_id: newIssue.association_id,
    property_id: newIssue.property_id,
    resident_id: newIssue.resident_id,
    violation_type: newIssue.violation_type,
    description: newIssue.description,
    status: newIssue.status,
    fine_amount: newIssue.fine_amount,
    due_date: newIssue.due_date,
    resolved_date: newIssue.resolved_date,
    created_at: newIssue.created_at,
    updated_at: newIssue.updated_at
  };
};

export const updateComplianceIssue = async (id: string, issue: Partial<Compliance>): Promise<Compliance> => {
  const { data, error } = await supabase
    .from('compliance_issues' as any)
    .update(issue as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast.error(`Error updating compliance issue: ${error.message}`);
    throw new Error(`Error updating compliance issue: ${error.message}`);
  }

  toast.success('Compliance issue updated successfully');
  const updatedIssue = data as any;
  
  return {
    id: updatedIssue.id,
    association_id: updatedIssue.association_id,
    property_id: updatedIssue.property_id,
    resident_id: updatedIssue.resident_id,
    violation_type: updatedIssue.violation_type,
    description: updatedIssue.description,
    status: updatedIssue.status,
    fine_amount: updatedIssue.fine_amount,
    due_date: updatedIssue.due_date,
    resolved_date: updatedIssue.resolved_date,
    created_at: updatedIssue.created_at,
    updated_at: updatedIssue.updated_at
  };
};

export const deleteComplianceIssue = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('compliance_issues' as any)
    .delete()
    .eq('id', id);

  if (error) {
    toast.error(`Error deleting compliance issue: ${error.message}`);
    throw new Error(`Error deleting compliance issue: ${error.message}`);
  }

  toast.success('Compliance issue deleted successfully');
};
