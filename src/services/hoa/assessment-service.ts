import { supabase } from '@/integrations/supabase/client';
import { Assessment, AssessmentType } from '@/types/assessment-types';
import { toast } from 'sonner';

export const fetchAssessmentsByProperty = async (propertyId: string): Promise<Assessment[]> => {
  const { data, error } = await supabase
    .from('assessments' as any)
    .select('*')
    .eq('property_id', propertyId)
    .order('due_date');

  if (error) {
    toast.error(`Error fetching assessments: ${error.message}`);
    throw new Error(`Error fetching assessments: ${error.message}`);
  }

  return (data as any[]).map(assessment => ({
    id: assessment.id,
    property_id: assessment.property_id,
    association_id: assessment.association_id || "placeholder-association-id",
    assessment_type_id: assessment.assessment_type_id,
    assessment_type: assessment.assessment_type || "monthly",
    amount: assessment.amount,
    due_date: assessment.due_date,
    paid: assessment.paid,
    status: assessment.paid ? "paid" : "unpaid",
    payment_date: assessment.payment_date,
    late_fee: assessment.late_fee,
    created_at: assessment.created_at,
    updated_at: assessment.updated_at
  }));
};

export const fetchAssessmentById = async (id: string): Promise<Assessment> => {
  const { data, error } = await supabase
    .from('assessments' as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    toast.error(`Error fetching assessment: ${error.message}`);
    throw new Error(`Error fetching assessment: ${error.message}`);
  }

  const assessment = data as any;
  
  return {
    id: assessment.id,
    property_id: assessment.property_id,
    association_id: assessment.association_id || "placeholder-association-id",
    assessment_type_id: assessment.assessment_type_id,
    assessment_type: assessment.assessment_type || "monthly",
    amount: assessment.amount,
    due_date: assessment.due_date,
    paid: assessment.paid,
    status: assessment.paid ? "paid" : "unpaid",
    payment_date: assessment.payment_date,
    late_fee: assessment.late_fee,
    created_at: assessment.created_at,
    updated_at: assessment.updated_at
  };
};

export const createAssessment = async (assessment: Partial<Assessment>): Promise<Assessment> => {
  const { data, error } = await supabase
    .from('assessments' as any)
    .insert({
      property_id: assessment.property_id,
      assessment_type_id: assessment.assessment_type_id,
      amount: assessment.amount,
      due_date: assessment.due_date,
      paid: assessment.paid,
      payment_date: assessment.payment_date,
      late_fee: assessment.late_fee
    } as any)
    .select()
    .single();

  if (error) {
    toast.error(`Error creating assessment: ${error.message}`);
    throw new Error(`Error creating assessment: ${error.message}`);
  }

  toast.success('Assessment created successfully');
  const newAssessment = data as any;
  
  return {
    id: newAssessment.id,
    property_id: newAssessment.property_id,
    association_id: newAssessment.association_id || "placeholder-association-id",
    assessment_type_id: newAssessment.assessment_type_id,
    assessment_type: newAssessment.assessment_type || "monthly",
    amount: newAssessment.amount,
    due_date: newAssessment.due_date,
    paid: newAssessment.paid,
    status: newAssessment.paid ? "paid" : "unpaid",
    payment_date: newAssessment.payment_date,
    late_fee: newAssessment.late_fee,
    created_at: newAssessment.created_at,
    updated_at: newAssessment.updated_at
  };
};

export const updateAssessment = async (id: string, assessment: Partial<Assessment>): Promise<Assessment> => {
  const dbAssessment = {
    property_id: assessment.property_id,
    assessment_type_id: assessment.assessment_type_id,
    amount: assessment.amount,
    due_date: assessment.due_date,
    paid: assessment.paid,
    payment_date: assessment.payment_date,
    late_fee: assessment.late_fee
  };

  const { data, error } = await supabase
    .from('assessments' as any)
    .update(dbAssessment as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast.error(`Error updating assessment: ${error.message}`);
    throw new Error(`Error updating assessment: ${error.message}`);
  }

  toast.success('Assessment updated successfully');
  const updatedAssessment = data as any;
  
  return {
    id: updatedAssessment.id,
    property_id: updatedAssessment.property_id,
    association_id: updatedAssessment.association_id || "placeholder-association-id",
    assessment_type_id: updatedAssessment.assessment_type_id,
    assessment_type: updatedAssessment.assessment_type || "monthly",
    amount: updatedAssessment.amount,
    due_date: updatedAssessment.due_date,
    paid: updatedAssessment.paid,
    status: updatedAssessment.paid ? "paid" : "unpaid",
    payment_date: updatedAssessment.payment_date,
    late_fee: updatedAssessment.late_fee,
    created_at: updatedAssessment.created_at,
    updated_at: updatedAssessment.updated_at
  };
};

export const deleteAssessment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('assessments' as any)
    .delete()
    .eq('id', id);

  if (error) {
    toast.error(`Error deleting assessment: ${error.message}`);
    throw new Error(`Error deleting assessment: ${error.message}`);
  }

  toast.success('Assessment deleted successfully');
};

export const fetchAssessmentTypesByHOA = async (hoaId: string): Promise<AssessmentType[]> => {
  const { data, error } = await supabase
    .from('assessment_types' as any)
    .select('*')
    .eq('association_id', hoaId)
    .order('name');

  if (error) {
    toast.error(`Error fetching assessment types: ${error.message}`);
    throw new Error(`Error fetching assessment types: ${error.message}`);
  }

  return (data as any[]).map(type => ({
    id: type.id,
    association_id: type.association_id,
    name: type.name,
    description: type.description,
    is_recurring: type.is_recurring,
    recurrence_period: type.recurrence_period,
    created_at: type.created_at,
    updated_at: type.updated_at
  }));
};

export const createAssessmentType = async (assessmentType: Partial<AssessmentType>): Promise<AssessmentType> => {
  const { data, error } = await supabase
    .from('assessment_types' as any)
    .insert(assessmentType as any)
    .select()
    .single();

  if (error) {
    toast.error(`Error creating assessment type: ${error.message}`);
    throw new Error(`Error creating assessment type: ${error.message}`);
  }

  toast.success('Assessment type created successfully');
  const newType = data as any;
  
  return {
    id: newType.id,
    association_id: newType.association_id,
    name: newType.name,
    description: newType.description,
    is_recurring: newType.is_recurring,
    recurrence_period: newType.recurrence_period,
    created_at: newType.created_at,
    updated_at: newType.updated_at
  };
};
