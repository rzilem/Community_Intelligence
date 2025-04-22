
import React from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { FileText, Filter, Plus, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { useAuth } from '@/contexts/auth';
import { useAssociationFormTemplates } from '@/hooks/form-builder/useAssociationFormTemplates';
import FormSelectionDialog from '@/components/portal/homeowner/forms/FormSelectionDialog';
import FormSubmissionDialog from '@/components/portal/homeowner/forms/FormSubmissionDialog';
import { useRequestForm } from '@/hooks/portal/useRequestForm';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const BoardFormsPage = () => {
  const { currentAssociation } = useAuth();
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Get all form types for the board portal
  const { data: forms = [], isLoading: formsLoading } = useAssociationFormTemplates(
    currentAssociation?.id
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

  // Filter forms based on active tab and search query
  const filteredForms = forms.filter(form => {
    const matchesTab = activeTab === 'all' || form.form_type === activeTab;
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getFormTypeLabel = (type: string | null) => {
    switch (type) {
      case 'portal_request': return 'Request Form';
      case 'arc_application': return 'ARC Application';
      case 'pool_form': return 'Pool Form';
      case 'gate_request': return 'Gate Request';
      default: return 'Other';
    }
  };

  const getFormTypeColor = (type: string | null) => {
    switch (type) {
      case 'portal_request': return 'bg-blue-100 text-blue-800';
      case 'arc_application': return 'bg-green-100 text-green-800';
      case 'pool_form': return 'bg-purple-100 text-purple-800';
      case 'gate_request': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PortalPageLayout
      title="Forms"
      icon={<Clipboard className="h-6 w-6" />}
      description="Submit and manage forms for your association"
      portalType="board"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="board" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Form
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Forms</TabsTrigger>
              <TabsTrigger value="arc_application">ARC Applications</TabsTrigger>
              <TabsTrigger value="pool_form">Pool Forms</TabsTrigger>
              <TabsTrigger value="portal_request">Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Available Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  {formsLoading ? (
                    <p className="text-center py-4">Loading forms...</p>
                  ) : filteredForms.length > 0 ? (
                    <div className="grid gap-4">
                      {filteredForms.map((form) => (
                        <div key={form.id} className="p-4 border rounded-md hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => handleFormSelection(form)}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{form.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {form.description || 'No description provided'}
                              </p>
                            </div>
                            <Badge className={`${getFormTypeColor(form.form_type)}`}>
                              {getFormTypeLabel(form.form_type)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No forms available for this category.</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create a Form
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <FormSelectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        forms={forms}
        formsLoading={formsLoading}
        onFormSelect={handleFormSelection}
      />

      <FormSubmissionDialog
        open={isSubmitFormDialogOpen}
        onOpenChange={setIsSubmitFormDialogOpen}
        form={selectedForm}
        values={formData}
        onFieldChange={handleFieldChange}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </PortalPageLayout>
  );
};

export default BoardFormsPage;
