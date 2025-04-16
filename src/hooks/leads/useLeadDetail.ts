
import { useState, useEffect } from 'react';
import { Lead } from '@/types/lead-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLeadDetail = (leadId: string | undefined) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) {
      fetchLead(leadId);
    }
  }, [leadId]);

  const fetchLead = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLead(data as unknown as Lead);
    } catch (error: any) {
      toast.error(`Error loading lead: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Lead['status']) => {
    if (!lead) return;
    
    try {
      const { error } = await supabase
        .from('leads' as any)
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);
        
      if (error) throw error;
      
      setLead(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Lead status updated to ${newStatus}`);
      
      // If status is changed to 'converted', show a success message about onboarding
      if (newStatus === 'converted') {
        toast.success('Onboarding process will be automatically initiated');
      }
    } catch (error: any) {
      toast.error(`Error updating status: ${error.message}`);
    }
  };

  const handleSaveNotes = async (notes: string) => {
    if (!lead) return;
    
    try {
      const { error } = await supabase
        .from('leads' as any)
        .update({ 
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);
        
      if (error) throw error;
      
      setLead(prev => prev ? { ...prev, notes } : null);
      toast.success('Notes updated successfully');
    } catch (error: any) {
      toast.error(`Error updating notes: ${error.message}`);
    }
  };

  const handleAssociationUpdate = async (associationData: Partial<Lead>) => {
    if (!lead) return;
    
    try {
      const { error } = await supabase
        .from('leads' as any)
        .update({ 
          ...associationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);
        
      if (error) throw error;
      
      setLead(prev => prev ? { ...prev, ...associationData } : null);
      toast.success('Association details updated successfully');
    } catch (error: any) {
      toast.error(`Error updating association details: ${error.message}`);
    }
  };

  return {
    lead,
    loading,
    handleStatusChange,
    handleSaveNotes,
    handleAssociationUpdate
  };
};
