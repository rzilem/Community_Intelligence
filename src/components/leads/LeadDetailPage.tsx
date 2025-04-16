
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { User, Building2, Calendar, FileText, MessageSquare, Clock, Paperclip } from 'lucide-react';
import { Lead } from '@/types/lead-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Import refactored components
import LeadDetailHeader from './detail/LeadDetailHeader';
import LeadDetailsTab from './detail/tabs/LeadDetailsTab';
import LeadAssociationTab from './detail/tabs/LeadAssociationTab';
import LeadCommunicationTab from './detail/tabs/LeadCommunicationTab';
import LeadHistoryTab from './detail/tabs/LeadHistoryTab';
import LeadDocumentsTab from './detail/tabs/LeadDocumentsTab';
import LeadNotesTabContainer from './detail/tabs/LeadNotesTabContainer';
import AttachmentsTab from './tabs/AttachmentsTab';
import { useOnboardingProjects } from '@/hooks/onboarding/useOnboardingProjects';

const LeadDetailPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const { createProject, isCreating } = useOnboardingProjects();

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

  const handleStartOnboarding = async (templateId: string) => {
    if (!lead || !templateId) return;
    
    try {
      await createProject({
        lead_id: lead.id,
        template_id: templateId,
        name: `Onboarding - ${lead.association_name || lead.name}`,
        status: 'active'
      });
      
      navigate(`/lead-management/onboarding`);
    } catch (error: any) {
      toast.error(`Failed to start onboarding: ${error.message}`);
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

  if (loading) {
    return (
      <PageTemplate 
        title="Lead Details" 
        icon={<User className="h-8 w-8" />}
        description="Loading lead information..."
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </PageTemplate>
    );
  }

  if (!lead) {
    return (
      <PageTemplate 
        title="Lead Not Found" 
        icon={<User className="h-8 w-8" />}
        description="The requested lead could not be found."
      >
        <div className="flex justify-center">
          <button onClick={() => navigate('/lead-management/dashboard')}>
            Back to Leads
          </button>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={lead.association_name || lead.name} 
      icon={<User className="h-8 w-8" />}
      description={`Lead details for ${lead.email}`}
      actions={
        <LeadDetailHeader
          lead={lead}
          onStatusChange={handleStatusChange}
          onStartOnboarding={handleStartOnboarding}
          isCreating={isCreating}
        />
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Lead Details
            </TabsTrigger>
            <TabsTrigger value="association" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Association
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Communication
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Attachments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <LeadDetailsTab lead={lead} />
          </TabsContent>
          
          <TabsContent value="association" className="mt-6">
            <LeadAssociationTab lead={lead} />
          </TabsContent>
          
          <TabsContent value="communication" className="mt-6">
            <LeadCommunicationTab />
          </TabsContent>
          
          <TabsContent value="notes" className="mt-6">
            <LeadNotesTabContainer lead={lead} onSaveNotes={handleSaveNotes} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <LeadHistoryTab />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <LeadDocumentsTab />
          </TabsContent>
          
          <TabsContent value="attachments" className="mt-6">
            <AttachmentsTab lead={lead} />
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default LeadDetailPage;
