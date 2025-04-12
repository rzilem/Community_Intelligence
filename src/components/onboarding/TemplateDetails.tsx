
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { OnboardingTemplate } from '@/types/onboarding-types';
import { getTemplateIcon } from './onboarding-utils';
import { toast } from 'sonner';
import TemplateDetailHeader from './template-details/TemplateDetailHeader';
import TemplateInfoCard from './template-details/TemplateInfoCard';
import StagesList from './template-details/StagesList';
import AddStageDialog from './template-details/AddStageDialog';

const TemplateDetails = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { 
    templates, 
    getTemplateStages, 
    getStageTasks,
    createStage,
    refreshTemplates
  } = useOnboardingTemplates();

  const [template, setTemplate] = useState<OnboardingTemplate | null>(null);
  const [stages, setStages] = useState([]);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [tasksByStage, setTasksByStage] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [stageFormData, setStageFormData] = useState({
    name: '',
    description: '',
    estimated_days: 5
  });

  useEffect(() => {
    if (templateId) {
      loadTemplateData();
    }
  }, [templateId, templates]);

  const loadTemplateData = async () => {
    setIsLoading(true);
    try {
      // Find template in the templates list
      const foundTemplate = templates.find(t => t.id === templateId);
      if (foundTemplate) {
        setTemplate(foundTemplate);
        
        // Load template stages
        const templateStages = await getTemplateStages(templateId);
        setStages(templateStages);
        
        // Load tasks for each stage
        const tasksData = {};
        for (const stage of templateStages) {
          const stageTasks = await getStageTasks(stage.id);
          tasksData[stage.id] = stageTasks;
        }
        setTasksByStage(tasksData);
      } else {
        toast.error('Template not found');
        navigate('/lead-management/onboarding');
      }
    } catch (error) {
      console.error('Error loading template data:', error);
      toast.error('Failed to load template data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStage = async () => {
    if (!templateId || !stageFormData.name) {
      toast.error('Stage name is required');
      return;
    }
    
    try {
      const newStage = await createStage({
        template_id: templateId,
        name: stageFormData.name,
        description: stageFormData.description,
        order_index: stages.length,
        estimated_days: stageFormData.estimated_days
      });
      
      setStages(prev => [...prev, newStage]);
      setTasksByStage(prev => ({ ...prev, [newStage.id]: [] }));
      setStageFormData({ name: '', description: '', estimated_days: 5 });
      setStageDialogOpen(false);
      toast.success('Stage added successfully');
    } catch (error) {
      console.error('Error adding stage:', error);
      toast.error('Failed to add stage');
    }
  };

  const handleStageInputChange = (e) => {
    const { name, value } = e.target;
    setStageFormData(prev => ({ 
      ...prev, 
      [name]: name === 'estimated_days' ? parseInt(value) || 0 : value 
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  if (!template) {
    return <div className="p-4">Template not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/lead-management/onboarding')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <TemplateDetailHeader template={template} />
      </div>

      <TemplateInfoCard template={template} stages={stages} />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Stages & Tasks</h2>
        <TooltipButton 
          onClick={() => setStageDialogOpen(true)}
          tooltip="Add a new stage to this template"
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Stage
        </TooltipButton>
      </div>

      <StagesList 
        stages={stages}
        tasks={tasksByStage}
        onAddStageClick={() => setStageDialogOpen(true)}
      />

      <AddStageDialog 
        open={stageDialogOpen}
        onOpenChange={setStageDialogOpen}
        formData={stageFormData}
        onInputChange={handleStageInputChange}
        onSubmit={handleAddStage}
      />
    </div>
  );
};

export default TemplateDetails;
