
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { OnboardingTemplate, OnboardingStage, OnboardingTask } from '@/types/onboarding-types';
import { 
  PlusCircle, Edit, Trash, 
  Home, Building, MapPin, 
  FileBox, ArrowRightLeft, 
  Check, Info, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import TooltipButton from '@/components/ui/tooltip-button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TemplateFormData {
  name: string;
  description: string;
  template_type: OnboardingTemplate['template_type'];
}

const templateTypeOptions = [
  { value: 'hoa', label: 'HOA', icon: <Home className="h-4 w-4 mr-2" /> },
  { value: 'condo', label: 'Condo', icon: <Building className="h-4 w-4 mr-2" /> },
  { value: 'onsite-hoa', label: 'On-site HOA', icon: <MapPin className="h-4 w-4 mr-2" /> },
  { value: 'onsite-condo', label: 'On-site Condo', icon: <MapPin className="h-4 w-4 mr-2" /> },
  { value: 'offboarding', label: 'Offboarding', icon: <ArrowRightLeft className="h-4 w-4 mr-2" /> },
];

const getTemplateIcon = (type: OnboardingTemplate['template_type']) => {
  switch (type) {
    case 'hoa':
      return <Home className="h-5 w-5 text-blue-500" />;
    case 'condo':
      return <Building className="h-5 w-5 text-purple-500" />;
    case 'onsite-hoa':
      return <MapPin className="h-5 w-5 text-green-500" />;
    case 'onsite-condo':
      return <MapPin className="h-5 w-5 text-indigo-500" />;
    case 'offboarding':
      return <ArrowRightLeft className="h-5 w-5 text-red-500" />;
    default:
      return <FileBox className="h-5 w-5 text-gray-500" />;
  }
};

const OnboardingTemplates = () => {
  const { 
    templates, 
    isLoading, 
    createTemplate, 
    updateTemplate,
    deleteTemplate,
    getTemplateStages,
    refreshTemplates
  } = useOnboardingTemplates();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<OnboardingTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({ 
    name: '', 
    description: '',
    template_type: 'hoa'
  });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [templateStages, setTemplateStages] = useState<Record<string, OnboardingStage[]>>({});
  const [loadingStages, setLoadingStages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    console.log("OnboardingTemplates component loaded. Templates:", templates);
    
    // Immediately fetch the templates if they're not loaded yet
    if (templates.length === 0 && !isLoading) {
      console.log("No templates found, refreshing...");
      refreshTemplates();
    }
    
    // Load stages for each template
    templates.forEach(template => {
      if (!templateStages[template.id]) {
        loadStagesForTemplate(template.id);
      }
    });
  }, [templates, isLoading]);

  const loadStagesForTemplate = async (templateId: string) => {
    setLoadingStages(prev => ({ ...prev, [templateId]: true }));
    try {
      const stages = await getTemplateStages(templateId);
      setTemplateStages(prev => ({ ...prev, [templateId]: stages }));
    } catch (error) {
      console.error('Error loading stages for template:', error);
    } finally {
      setLoadingStages(prev => ({ ...prev, [templateId]: false }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      template_type: value as OnboardingTemplate['template_type'] 
    }));
  };

  const handleCreateTemplate = async () => {
    if (!formData.name) {
      toast.error('Template name is required');
      return;
    }

    try {
      await createTemplate({
        name: formData.name,
        description: formData.description || undefined,
        template_type: formData.template_type,
        estimated_days: 30 // Default estimated days
      });
      setFormData({ name: '', description: '', template_type: 'hoa' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate || !formData.name) {
      toast.error('Template name is required');
      return;
    }

    try {
      await updateTemplate({
        id: selectedTemplate.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          template_type: formData.template_type
        }
      });
      setFormData({ name: '', description: '', template_type: 'hoa' });
      setSelectedTemplate(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await deleteTemplate(selectedTemplate.id);
      setSelectedTemplate(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const openCreateDialog = () => {
    setSelectedTemplate(null);
    setFormData({ name: '', description: '', template_type: 'hoa' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: OnboardingTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      template_type: template.template_type
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (template: OnboardingTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const filteredTemplates = activeTab === 'all' 
    ? templates 
    : templates.filter(t => t.template_type === activeTab);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Loading templates...</span>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Debug information */}
      <div className="text-sm text-muted-foreground bg-muted p-2 rounded mb-4">
        Available templates: {templates.length}
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Onboarding Templates</h2>
        <TooltipButton 
          tooltip="Create a new template for onboarding clients"
          className="flex items-center gap-2"
          onClick={openCreateDialog}
        >
          <PlusCircle className="h-4 w-4" />
          New Template
        </TooltipButton>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="hoa" className="flex items-center gap-1">
            <Home className="h-4 w-4" /> HOA
          </TabsTrigger>
          <TabsTrigger value="condo" className="flex items-center gap-1">
            <Building className="h-4 w-4" /> Condo
          </TabsTrigger>
          <TabsTrigger value="onsite-hoa" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> On-site HOA
          </TabsTrigger>
          <TabsTrigger value="onsite-condo" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> On-site Condo
          </TabsTrigger>
          <TabsTrigger value="offboarding" className="flex items-center gap-1">
            <ArrowRightLeft className="h-4 w-4" /> Offboarding
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground text-center">
              No templates found. Create your first onboarding template to get started.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={openCreateDialog}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              stages={templateStages[template.id] || []}
              isLoadingStages={loadingStages[template.id] || false}
              onEdit={() => openEditDialog(template)}
              onDelete={() => openDeleteDialog(template)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? 'Edit' : 'Create'} Onboarding Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Template Name</label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter template name" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="template_type" className="text-sm font-medium">Template Type</label>
              <Select 
                value={formData.template_type} 
                onValueChange={handleTemplateTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  {templateTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter template description" 
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}>
              {selectedTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete the "{selectedTemplate?.name}" template? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>Delete Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TemplateCardProps {
  template: OnboardingTemplate;
  stages: OnboardingStage[];
  isLoadingStages: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const TemplateCard = ({ template, stages, isLoadingStages, onEdit, onDelete }: TemplateCardProps) => {
  const totalStages = stages.length;
  const estimatedDays = stages.reduce(
    (total, stage) => total + (stage.estimated_days || 0), 
    0
  ) || template.estimated_days || 30;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getTemplateIcon(template.template_type)}
            <CardTitle className="text-lg">{template.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit template</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete template</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {template.description || 'No description provided'}
        </p>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Template Type:</span>
            <span className="font-medium">
              {templateTypeOptions.find(t => t.value === template.template_type)?.label || 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Days:</span>
            <span className="font-medium">{estimatedDays} days</span>
          </div>
          {isLoadingStages ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stages:</span>
              <span className="font-medium">{totalStages} stages</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full">
          <Info className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OnboardingTemplates;
