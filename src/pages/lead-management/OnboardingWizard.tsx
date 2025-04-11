import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { 
  ClipboardCheck, CheckCircle, Circle, Clock, Calendar, 
  Users, ArrowLeft, Plus, FileText, Upload, Trash2, MessageSquare,
  Home, Building, MapPin, FileBox, ArrowRightLeft, 
  Play, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { useOnboardingProjects } from '@/hooks/onboarding/useOnboardingProjects';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { OnboardingProjectTask, OnboardingTemplate } from '@/types/onboarding-types';
import { Lead } from '@/types/lead-types';
import { useLeads } from '@/hooks/leads/useLeads';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow, addDays } from 'date-fns';
import OnboardingTemplates from '@/components/onboarding/OnboardingTemplates';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import TooltipButton from '@/components/ui/tooltip-button';

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [projectTasks, setProjectTasks] = useState<OnboardingProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projects, getProjectTasks, getProjectLead, updateTaskStatus, createProjectFromTemplate } = useOnboardingProjects();
  const { templates } = useOnboardingTemplates();
  const { leads = [] } = useLeads();
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [viewMode, setViewMode] = useState<'project' | 'templates'>(projectId ? 'project' : 'templates');

  // Group the tasks by stage for display
  const [tasksByStage, setTasksByStage] = useState<any[]>([]);

  useEffect(() => {
    if (projectId) {
      setViewMode('project');
    } else if (projects.length > 0) {
      setViewMode('project');
    } else {
      setViewMode('templates');
    }
  }, [projectId, projects]);

  useEffect(() => {
    // If no projects exist yet or no specific project ID, show templates
    if (projects.length === 0 && !projectId && !isLoading) {
      setViewMode('templates');
      setIsLoading(false);
      return;
    }
    
    if (projectId && projects.length > 0) {
      // Find the specific project if projectId is provided
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        setActiveProject(project);
        
        // Load project tasks and associated lead info
        loadProjectData(project.id, project.lead_id);
      } else {
        setIsLoading(false);
      }
    } else if (projects.length > 0) {
      // Just load the first project if no specific projectId
      const project = projects[0];
      setActiveProject(project);
      
      // Load project tasks and associated lead info
      loadProjectData(project.id, project.lead_id);
    } else {
      setIsLoading(false);
    }
  }, [projects, projectId, isLoading]);

  const loadProjectData = async (projectId: string, leadId: string) => {
    setIsLoading(true);
    try {
      // Load tasks for this project
      const tasks = await getProjectTasks(projectId);
      setProjectTasks(tasks);
      
      // Load lead info
      const leadData = await getProjectLead(leadId);
      if (leadData) {
        setLead(leadData);
      }
      
      // Group tasks by stage
      const taskGroups = groupTasksByStage(tasks);
      setTasksByStage(taskGroups);
    } catch (error) {
      console.error("Error loading project data:", error);
      toast.error("Failed to load project data");
    } finally {
      setIsLoading(false);
    }
  };

  const groupTasksByStage = (tasks: OnboardingProjectTask[]) => {
    // Group tasks by stage
    const stageGroups: Record<string, any> = {};
    
    // First pass: create stage groups
    tasks.forEach(task => {
      if (!stageGroups[task.stage_name]) {
        stageGroups[task.stage_name] = {
          id: task.stage_name.toLowerCase().replace(/\s+/g, '-'),
          title: task.stage_name,
          completed: 0,
          total: 0,
          tasks: []
        };
      }
      
      stageGroups[task.stage_name].total++;
      if (task.status === 'completed') {
        stageGroups[task.stage_name].completed++;
      }
      
      stageGroups[task.stage_name].tasks.push({
        id: task.id,
        title: task.task_name,
        completed: task.status === 'completed',
        daysRequired: 1, // Use estimated days if available
        teamAssigned: task.task_type === 'team' ? 'Team' : 'Client',
        status: task.status,
        due_date: task.due_date
      });
    });
    
    // Convert to array and sort by name
    return Object.values(stageGroups).sort((a: any, b: any) => 
      a.title.localeCompare(b.title)
    );
  };

  const getStageColorClass = (completed: number, total: number) => {
    if (completed === 0) return "text-red-500 fill-red-500";
    if (completed === total) return "text-green-500 fill-green-500";
    return "text-yellow-500 fill-yellow-500";
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await updateTaskStatus(taskId, newStatus as any);
      
      // Update local state
      setProjectTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      // Update task groups
      setTasksByStage(prev => 
        prev.map(stage => ({
          ...stage,
          tasks: stage.tasks.map((task: any) => 
            task.id === taskId ? { ...task, completed: newStatus === 'completed' } : task
          ),
          completed: stage.tasks.filter((t: any) => 
            t.id === taskId ? newStatus === 'completed' : t.completed
          ).length
        }))
      );
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task status");
    }
  };

  const formatStartDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MM/dd/yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const calculateTotalProgress = () => {
    const total = projectTasks.length;
    if (total === 0) return 0;
    
    const completed = projectTasks.filter(task => task.status === 'completed').length;
    return (completed / total) * 100;
  };

  const calculateMetrics = () => {
    if (!activeProject) return { 
      completed: 0, 
      total: 0, 
      daysSinceStart: 0, 
      daysRemaining: 0, 
      clientAccess: "Inactive" 
    };
    
    const completed = projectTasks.filter(task => task.status === 'completed').length;
    
    // Calculate days since start
    const startDate = new Date(activeProject.start_date);
    const daysSinceStart = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Estimate days remaining based on tasks
    const remainingTasks = projectTasks.filter(task => task.status !== 'completed').length;
    const averageDaysPerTask = 3; // Assumption
    const daysRemaining = remainingTasks * averageDaysPerTask;
    
    return {
      completed,
      total: projectTasks.length,
      daysSinceStart,
      daysRemaining,
      clientAccess: activeProject.status === 'active' ? "Active" : "Inactive"
    };
  };

  const getTemplateIcon = (type?: string) => {
    switch (type) {
      case 'hoa':
        return <Home className="h-5 w-5 text-blue-600" />;
      case 'condo':
        return <Building className="h-5 w-5 text-purple-600" />;
      case 'onsite-hoa':
        return <MapPin className="h-5 w-5 text-green-600" />;
      case 'onsite-condo':
        return <MapPin className="h-5 w-5 text-indigo-600" />;
      case 'offboarding':
        return <ArrowRightLeft className="h-5 w-5 text-red-600" />;
      default:
        return <FileBox className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleCreateProject = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a template');
      return;
    }
    
    if (!selectedLeadId) {
      toast.error('Please select a lead');
      return;
    }
    
    if (!projectName) {
      toast.error('Please enter a project name');
      return;
    }
    
    setIsCreatingProject(true);
    
    try {
      const newProject = await createProjectFromTemplate({
        name: projectName,
        lead_id: selectedLeadId,
        template_id: selectedTemplateId,
        start_date: startDate.toISOString()
      });
      
      setIsNewProjectDialogOpen(false);
      setViewMode('project');
      
      // Clear form data
      setSelectedTemplateId('');
      setSelectedLeadId('');
      setProjectName('');
      setStartDate(new Date());
      
      // Navigate to the new project
      if (newProject?.id) {
        navigate(`/lead-management/onboarding/${newProject.id}`);
      }
      
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleLeadChange = (leadId: string) => {
    setSelectedLeadId(leadId);
    
    // Auto-fill project name based on lead information
    const selectedLead = leads.find(lead => lead.id === leadId);
    if (selectedLead) {
      const name = selectedLead.association_name || selectedLead.name || '';
      setProjectName(`${name} Onboarding`);
    }
  };

  const metrics = calculateMetrics();

  if (isLoading) {
    return (
      <PageTemplate 
        title="Community Onboarding" 
        icon={<ClipboardCheck className="h-8 w-8" />}
        description="Manage the onboarding process for new communities and associations."
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading onboarding data...</span>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title="Community Onboarding" 
      icon={<ClipboardCheck className="h-8 w-8" />}
      description="Manage the onboarding process for new communities and associations."
    >
      <div className="space-y-6">
        {/* Tabs to switch between project view and templates */}
        {projects.length > 0 && (
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'project' | 'templates')}>
            <TabsList>
              <TabsTrigger value="project">Active Projects</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        {viewMode === 'templates' ? (
          <OnboardingTemplates />
        ) : (
          <>
            {/* Active HOA Project */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {activeProject?.name || "No active projects"}
                </h2>
                {activeProject && (
                  <p className="text-muted-foreground">
                    Started {formatStartDate(activeProject.start_date)}
                    {lead && ` • ${lead.association_name || lead.name}`}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 mt-2 md:mt-0">
                <TooltipButton 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => navigate('/lead-management/dashboard')}
                  tooltip="Return to the Lead Management Dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </TooltipButton>
                <TooltipButton 
                  className="flex items-center gap-2"
                  onClick={() => setIsNewProjectDialogOpen(true)}
                  tooltip="Start a new onboarding project from a template"
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </TooltipButton>
              </div>
            </div>
            
            {/* Summary Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Onboarding Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      {metrics.completed} of {metrics.total} tasks completed
                    </p>
                    <Progress value={calculateTotalProgress()} className="h-2 mt-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-md">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="font-medium">{metrics.completed} tasks</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-md">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Days Since Start</p>
                        <p className="font-medium">{metrics.daysSinceStart} days</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-md">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Est. Days Remaining</p>
                        <p className="font-medium">{metrics.daysRemaining} days</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-md">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Client Access</p>
                        <p className="font-medium">{metrics.clientAccess}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tabs Section */}
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="bg-card border-b">
                <TabsTrigger value="tasks">Tasks & Timeline</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="sharing">Client Sharing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Timeline Sidebar */}
                  <Card className="md:col-span-1">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-4">Timeline</h3>
                      
                      <div className="space-y-6">
                        {tasksByStage.map((stage) => (
                          <div key={stage.id} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Circle className={getStageColorClass(stage.completed, stage.total)} />
                              <h4 className="font-medium">{stage.title}</h4>
                            </div>
                            
                            <p className="text-xs text-muted-foreground ml-7">
                              {stage.completed} of {stage.tasks?.length || 0} tasks completed
                            </p>
                            
                            <ul className="space-y-2 ml-7 border-l pl-4">
                              {stage.tasks?.map((task: any) => (
                                <li 
                                  key={task.id}
                                  className={`text-sm flex items-center gap-2 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                                >
                                  {task.completed ? (
                                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                  ) : (
                                    <Circle className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  )}
                                  <span>{task.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Task Details */}
                  <Card className="md:col-span-2">
                    <CardContent className="p-4">
                      <Accordion type="multiple" className="space-y-4">
                        {tasksByStage.map((stage) => (
                          <AccordionItem 
                            key={stage.id} 
                            value={stage.id}
                            className="border rounded-md"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20">
                              <div className="flex flex-col sm:flex-row sm:items-center w-full">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{stage.title}</span>
                                </div>
                                <span className="text-sm text-muted-foreground ml-0 sm:ml-2">
                                  {stage.completed} of {stage.tasks?.length || 0} tasks completed
                                </span>
                              </div>
                            </AccordionTrigger>
                            
                            <AccordionContent className="pt-2">
                              <div className="space-y-2">
                                {stage.tasks?.map((task: any) => (
                                  <div 
                                    key={task.id} 
                                    className="border rounded-md p-4 flex justify-between items-center"
                                  >
                                    <div className="flex items-center">
                                      <TooltipButton
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full p-0 h-6 w-6 mr-2"
                                        onClick={() => toggleTaskStatus(task.id, task.status || (task.completed ? 'completed' : 'pending'))}
                                        tooltip={task.completed ? "Mark as incomplete" : "Mark as completed"}
                                      >
                                        {task.completed ? (
                                          <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                          <Circle className="h-5 w-5 text-muted-foreground" />
                                        )}
                                      </TooltipButton>
                                      
                                      <span className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {task.title}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                      <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>Due {format(new Date(task.due_date), 'MMM d')}</span>
                                      </div>
                                      
                                      <div className={`text-sm px-2 py-1 rounded ${
                                        task.teamAssigned === 'Team' 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        {task.teamAssigned}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Management</CardTitle>
                    <CardDescription>Upload and manage documents for this onboarding process</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Documents</h3>
                        <TooltipButton className="flex gap-2 items-center" tooltip="Upload a new document to this project">
                          <Upload className="h-4 w-4" />
                          Upload Document
                        </TooltipButton>
                      </div>
                      
                      <div className="border rounded-md divide-y">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <FileText className="text-blue-500 h-5 w-5" />
                              <div>
                                <p className="font-medium">Document {i}.pdf</p>
                                <p className="text-xs text-muted-foreground">Uploaded 3 days ago</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <TooltipButton size="sm" variant="outline" className="h-8" tooltip="Download this document">
                                Download
                              </TooltipButton>
                              <TooltipButton size="sm" variant="ghost" className="h-8 text-red-500 hover:text-red-600" tooltip="Delete this document">
                                <Trash2 className="h-4 w-4" />
                              </TooltipButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="sharing">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Sharing Settings</CardTitle>
                    <CardDescription>Control what information is shared with the client during onboarding</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Client Portal Access</h3>
                          <p className="text-sm text-muted-foreground">Enable or disable client access to the onboarding portal</p>
                        </div>
                        <div className="flex items-center">
                          <div className="bg-green-500 h-3 w-3 rounded-full mr-2"></div>
                          <span>Active</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Contact Information</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border p-4 rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">Primary Contact</p>
                                <p className="text-sm">John Smith - Board President</p>
                                <p className="text-sm text-muted-foreground">john.smith@example.com</p>
                                <p className="text-sm text-muted-foreground">(555) 123-4567</p>
                              </div>
                              <TooltipButton variant="ghost" size="sm" tooltip="Send a message to this contact">
                                <MessageSquare className="h-4 w-4" />
                              </TooltipButton>
                            </div>
                          </div>
                          
                          <div className="border p-4 rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">Secondary Contact</p>
                                <p className="text-sm">Sarah Johnson - Treasurer</p>
                                <p className="text-sm text-muted-foreground">sarah.j@example.com</p>
                                <p className="text-sm text-muted-foreground">(555) 987-6543</p>
                              </div>
                              <TooltipButton variant="ghost" size="sm" tooltip="Send a message to this contact">
                                <MessageSquare className="h-4 w-4" />
                              </TooltipButton>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <TooltipButton tooltip="Add a new contact to this project">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Contact
                          </TooltipButton>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Create New Project Dialog */}
      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Onboarding Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Templates</SelectLabel>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          {getTemplateIcon(template.template_type)}
                          <span>{template.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Lead</label>
              <Select value={selectedLeadId} onValueChange={handleLeadChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Active Leads</SelectLabel>
                    {leads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.association_name || lead.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject} disabled={isCreatingProject}>
              {isCreatingProject ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
};

export default OnboardingWizard;
