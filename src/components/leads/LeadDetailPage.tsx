
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, Building2, Calendar, FileText, ChevronLeft, UserPlus, Paperclip, MessageSquare, Clock } from 'lucide-react';
import { Lead } from '@/types/lead-types';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import LeadStatusBadge from './LeadStatusBadge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { useOnboardingProjects } from '@/hooks/onboarding/useOnboardingProjects';
import AttachmentsTab from './tabs/AttachmentsTab';
import LeadNotesTab from './detail/LeadNotesTab';
import { extractCity, createGoogleMapsLink } from './detail/address-utils';

const LeadDetailPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const { templates } = useOnboardingTemplates();
  const { createProject, isCreating } = useOnboardingProjects();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

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

  const handleStartOnboarding = async () => {
    if (!lead || !selectedTemplateId) return;
    
    try {
      await createProject({
        lead_id: lead.id,
        template_id: selectedTemplateId,
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
          <Button onClick={() => navigate('/lead-management/dashboard')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
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
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/lead-management/dashboard')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Start Onboarding
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start Onboarding Process</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Template</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                    >
                      <option value="">Select an onboarding template</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button 
                  onClick={handleStartOnboarding}
                  disabled={!selectedTemplateId || isCreating}
                >
                  {isCreating ? 'Starting...' : 'Start Process'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <LeadStatusBadge status={lead.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  <span className="inline-block bg-muted px-2 py-1 rounded-md text-sm">
                    {lead.source}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant={lead.status === 'new' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('new')}
                >New</Button>
                <Button 
                  size="sm" 
                  variant={lead.status === 'contacted' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('contacted')}
                >Contacted</Button>
                <Button 
                  size="sm" 
                  variant={lead.status === 'qualified' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('qualified')}
                >Qualified</Button>
                <Button 
                  size="sm" 
                  variant={lead.status === 'proposal' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('proposal')}
                >Proposal</Button>
                <Button 
                  size="sm" 
                  variant={lead.status === 'converted' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('converted')}
                >Converted</Button>
                <Button 
                  size="sm" 
                  variant={lead.status === 'lost' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('lost')}
                >Lost</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                        <dd>{lead.name}</dd>
                      </div>
                      {lead.first_name && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">First Name</dt>
                          <dd>{lead.first_name}</dd>
                        </div>
                      )}
                      {lead.last_name && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Last Name</dt>
                          <dd>{lead.last_name}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                        <dd>{lead.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                        <dd>{lead.phone || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Company</dt>
                        <dd>{lead.company || 'Not provided'}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Street</dt>
                        <dd>
                          {lead.street_address ? (
                            <a 
                              href={createGoogleMapsLink(lead.street_address)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {lead.street_address}
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </dd>
                      </div>
                      {lead.address_line2 && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Address Line 2</dt>
                          <dd>{lead.address_line2}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">City</dt>
                        <dd>{extractCity(lead.city, lead.street_address) || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">State</dt>
                        <dd>{lead.state || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">ZIP</dt>
                        <dd>{lead.zip || 'Not provided'}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Lead Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Source</dt>
                        <dd>{lead.source}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                        <dd className="capitalize">{lead.status}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                        <dd>{new Date(lead.created_at).toLocaleDateString()}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                        <dd>{new Date(lead.updated_at).toLocaleDateString()}</dd>
                      </div>
                      
                      {lead.tracking_number && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Tracking Number</dt>
                          <dd>{lead.tracking_number}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Association Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Association Name</dt>
                        <dd>{lead.association_name || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Association Type</dt>
                        <dd>{lead.association_type || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Number of Units</dt>
                        <dd>{lead.number_of_units || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Current Management</dt>
                        <dd>{lead.current_management || 'Not provided'}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap">
                      {lead.additional_requirements 
                        ? lead.additional_requirements 
                        : lead.html_content 
                        ? 'See original email for additional information.'
                        : 'No additional requirements specified.'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="association" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Association Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Association Name</dt>
                    <dd>{lead.association_name || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Association Type</dt>
                    <dd>{lead.association_type || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Number of Units</dt>
                    <dd>{lead.number_of_units || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Current Management</dt>
                    <dd>{lead.current_management || 'Not provided'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="communication" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center py-8">
                  Communication history will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notes</CardTitle>
                <Button onClick={() => {
                  const notes = prompt('Enter notes:', lead.notes || '');
                  if (notes !== null) {
                    handleSaveNotes(notes);
                  }
                }}>
                  Edit Notes
                </Button>
              </CardHeader>
              <CardContent>
                <LeadNotesTab lead={lead} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center py-8">
                  Lead history and tracking will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center py-8">
                  Documents will be displayed here.
                </p>
              </CardContent>
            </Card>
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
