
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Tabs, TabsList, TabsTrigger, TabsContent 
} from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { 
  ChevronLeft, Plus, GripVertical, Edit, Trash, 
  ArrowUp, ArrowDown, Calendar, CheckCircle
} from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { OnboardingTemplate, OnboardingStage, OnboardingTask } from '@/types/onboarding-types';
import { getTemplateIcon } from './onboarding-utils';
import { toast } from 'sonner';

const TemplateDetails = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { 
    templates, 
    getTemplateStages, 
    getStageTasks,
    createStage,
    createTask,
    refreshTemplates
  } = useOnboardingTemplates();

  const [template, setTemplate] = useState<OnboardingTemplate | null>(null);
  const [stages, setStages] = useState<OnboardingStage[]>([]);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [tasksByStage, setTasksByStage] = useState<Record<string, OnboardingTask[]>>({});
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
        const tasksData: Record<string, OnboardingTask[]> = {};
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

  const handleStageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/lead-management/onboarding')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-center">
            {getTemplateIcon(template.template_type)}
            <h1 className="text-2xl font-bold ml-2">{template.name}</h1>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>{template.description || 'No description provided'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Template Type</p>
              <div className="flex items-center">
                {getTemplateIcon(template.template_type)}
                <span className="ml-2">
                  {template.template_type.charAt(0).toUpperCase() + template.template_type.slice(1)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Total Stages</p>
              <p>{stages.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Estimated Timeline</p>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {stages.reduce((total, stage) => total + (stage.estimated_days || 0), 0) || 
                    template.estimated_days || 30} days
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {stages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground text-center">
              No stages found. Add your first stage to get started.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setStageDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Stage
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <StageCard 
              key={stage.id}
              stage={stage}
              tasks={tasksByStage[stage.id] || []}
              onAddTask={async (task) => {
                if (!task.name) {
                  toast.error('Task name is required');
                  return;
                }
                try {
                  const newTask = await createTask({
                    stage_id: stage.id,
                    name: task.name,
                    description: task.description,
                    order_index: tasksByStage[stage.id]?.length || 0,
                    estimated_days: task.estimated_days,
                    assigned_role: task.assigned_role,
                    task_type: task.task_type
                  });
                  
                  setTasksByStage(prev => ({
                    ...prev,
                    [stage.id]: [...(prev[stage.id] || []), newTask]
                  }));
                  toast.success('Task added successfully');
                  return true;
                } catch (error) {
                  console.error('Error adding task:', error);
                  toast.error('Failed to add task');
                  return false;
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Add Stage Dialog */}
      <Dialog open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="stage-name" className="text-sm font-medium">Stage Name</label>
              <Input 
                id="stage-name"
                name="name"
                value={stageFormData.name}
                onChange={handleStageInputChange}
                placeholder="Enter stage name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="stage-description" className="text-sm font-medium">Description</label>
              <Textarea 
                id="stage-description"
                name="description"
                value={stageFormData.description}
                onChange={handleStageInputChange}
                placeholder="Enter stage description (optional)"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="stage-days" className="text-sm font-medium">Estimated Days</label>
              <Input 
                id="stage-days"
                name="estimated_days"
                type="number"
                value={stageFormData.estimated_days.toString()}
                onChange={handleStageInputChange}
                min={1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStage}>Add Stage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface StageCardProps {
  stage: OnboardingStage;
  tasks: OnboardingTask[];
  onAddTask: (task: {
    name: string;
    description?: string;
    estimated_days?: number;
    assigned_role?: string;
    task_type: 'client' | 'team';
  }) => Promise<boolean>;
}

const StageCard = ({ stage, tasks, onAddTask }: StageCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    description: '',
    estimated_days: 1,
    assigned_role: '',
    task_type: 'team' as 'client' | 'team'
  });

  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ 
      ...prev, 
      [name]: name === 'estimated_days' ? parseInt(value) || 0 : value 
    }));
  };

  const handleAddTask = async () => {
    const success = await onAddTask(taskFormData);
    if (success) {
      setTaskFormData({
        name: '',
        description: '',
        estimated_days: 1,
        assigned_role: '',
        task_type: 'team'
      });
      setTaskDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
            <CardTitle className="text-lg">{stage.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{stage.estimated_days || 0} days</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {tasks.length} tasks
            </div>
            <Button
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setTaskDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No tasks in this stage yet. Add your first task.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[100px]">Days</TableHead>
                  <TableHead className="w-[100px]">Role</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task, index) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{task.name}</div>
                      {task.description && (
                        <div className="text-xs text-muted-foreground mt-1">{task.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.task_type === 'client' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {task.task_type}
                      </span>
                    </TableCell>
                    <TableCell>{task.estimated_days || 1}</TableCell>
                    <TableCell>{task.assigned_role || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      )}

      {/* Add Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task to {stage.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="task-name" className="text-sm font-medium">Task Name</label>
              <Input 
                id="task-name"
                name="name"
                value={taskFormData.name}
                onChange={handleTaskInputChange}
                placeholder="Enter task name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="task-description" className="text-sm font-medium">Description</label>
              <Textarea 
                id="task-description"
                name="description"
                value={taskFormData.description}
                onChange={handleTaskInputChange}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="task-days" className="text-sm font-medium">Estimated Days</label>
                <Input 
                  id="task-days"
                  name="estimated_days"
                  type="number"
                  value={taskFormData.estimated_days.toString()}
                  onChange={handleTaskInputChange}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="task-type" className="text-sm font-medium">Task Type</label>
                <select
                  id="task-type"
                  name="task_type"
                  value={taskFormData.task_type}
                  onChange={handleTaskInputChange as any}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="team">Team</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="assigned-role" className="text-sm font-medium">Assigned Role (Optional)</label>
              <Input 
                id="assigned-role"
                name="assigned_role"
                value={taskFormData.assigned_role}
                onChange={handleTaskInputChange}
                placeholder="E.g., Manager, Accountant, Resident"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TemplateDetails;
