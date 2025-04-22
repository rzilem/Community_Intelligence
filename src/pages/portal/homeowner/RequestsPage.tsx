
import React, { useEffect } from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { FileText, Filter, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { useAuth } from '@/contexts/auth';
import { useAssociationFormTemplates } from '@/hooks/form-builder/useAssociationFormTemplates';
import FormSelectionDialog from '@/components/portal/homeowner/forms/FormSelectionDialog';
import FormSubmissionDialog from '@/components/portal/homeowner/forms/FormSubmissionDialog';
import { useRequestForm } from '@/hooks/portal/useRequestForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const RequestsPage = () => {
  const { currentUser, currentAssociation } = useAuth();
  const { data: associationForms = [], isLoading: formsLoading, error: formsError } = useAssociationFormTemplates(
    currentAssociation?.id,
    'portal_request'
  );
  
  const {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isSubmitFormDialogOpen,
    setIsSubmitFormDialogOpen,
    selectedForm,
    formData,
    handleFormSelection,
    handleFieldChange,
    handleFormSubmit,
    isSubmitting
  } = useRequestForm();

  const [userRequests, setUserRequests] = React.useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = React.useState(true);

  useEffect(() => {
    if (currentUser?.id && currentAssociation?.id) {
      fetchUserRequests();
    }
  }, [currentUser, currentAssociation]);

  const fetchUserRequests = async () => {
    if (!currentUser?.id || !currentAssociation?.id) return;
    
    try {
      setIsLoadingRequests(true);
      const { data, error } = await supabase
        .from('homeowner_requests')
        .select('*')
        .eq('resident_id', currentUser.id)
        .eq('association_id', currentAssociation.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user requests:', error);
        toast.error('Failed to load your requests');
      } else {
        setUserRequests(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Modified to return boolean
  const handleFormSubmitWithResult = async () => {
    const result = await handleFormSubmit();
    if (result) {
      fetchUserRequests();
    }
    return result;
  };

  return (
    <PortalPageLayout 
      title="Homeowner Requests" 
      icon={<FileText className="h-6 w-6" />}
      description="Submit and track requests for your property"
      portalType="homeowner"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="homeowner" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Request
            </Button>
          </div>
          
          {formsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was an error loading form templates. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Your Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRequests ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : userRequests.length > 0 ? (
                <div className="space-y-4">
                  {userRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{request.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()} · 
                            Status: <span className="capitalize">{request.status}</span> · 
                            Priority: <span className="capitalize">{request.priority}</span>
                          </p>
                        </div>
                        <div className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1">
                          {request.tracking_number || 'No tracking #'}
                        </div>
                      </div>
                      <p className="mt-2 text-sm line-clamp-2">{request.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You haven't submitted any requests yet.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Submit Your First Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <FormSelectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        forms={associationForms}
        formsLoading={formsLoading}
        onFormSelect={handleFormSelection}
      />

      <FormSubmissionDialog
        open={isSubmitFormDialogOpen}
        onOpenChange={setIsSubmitFormDialogOpen}
        form={selectedForm}
        values={formData}
        onFieldChange={handleFieldChange}
        onSubmit={handleFormSubmitWithResult}
        isSubmitting={isSubmitting}
      />
    </PortalPageLayout>
  );
};

export default RequestsPage;
