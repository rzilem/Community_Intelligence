
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { 
  ClipboardCheck, CheckCircle, Circle, Clock, Calendar, 
  Users, ArrowLeft, Plus, FileText, Upload, Trash2, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '@/components/ui/accordion';
import { useOnboardingProjects } from '@/hooks/onboarding/useOnboardingProjects';
import { OnboardingProjectTask } from '@/types/onboarding-types';
import { Lead } from '@/types/lead-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [projectTasks, setProjectTasks] = useState<OnboardingProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projects, getProjectTasks, getProjectLead, updateTaskStatus } = useOnboardingProjects();

  // Group the tasks by stage for display
  const [tasksByStage, setTasksByStage] = useState<any[]>([]);

  useEffect(() => {
    // If no projects exist yet, this will be empty - create demo data
    if (projects.length === 0 && !isLoading) {
      // Demo data
      setActiveProject({
        id: "demo-id",
        name: "Sunset Valley HOA",
        start_date: "2023-05-01T12:00:00Z",
        status: "active"
      });

      setTasksByStage([
        {
          id: "initial-setup",
          title: "Initial Setup",
          icon: <Circle className="text-red-500 fill-red-500" />,
          completed: 2,
          tasks: [
            { 
              id: "collect-docs", 
              title: "Collect association documents", 
              completed: true, 
              daysRequired: 5, 
              teamAssigned: "Team" 
            },
            { 
              id: "setup-client", 
              title: "Setup client in management software", 
              completed: true, 
              daysRequired: 2, 
              teamAssigned: "Team" 
            },
            { 
              id: "schedule-kickoff", 
              title: "Schedule kickoff meeting", 
              completed: false, 
              daysRequired: 3, 
              teamAssigned: "Team" 
            }
          ]
        },
        {
          id: "financial-setup",
          title: "Financial Setup",
          icon: <Circle className="text-red-500 fill-red-500" />,
          completed: 0,
          tasks: [
            { 
              id: "setup-bank", 
              title: "Setup bank accounts", 
              completed: false, 
              daysRequired: 5, 
              teamAssigned: "Team" 
            },
            { 
              id: "import-financial", 
              title: "Import financial history", 
              completed: false, 
              daysRequired: 3, 
              teamAssigned: "Team" 
            }
          ]
        },
        {
          id: "community-setup",
          title: "Community Setup",
          icon: <Circle className="text-yellow-500 fill-yellow-500" />,
          completed: 0,
          tasks: [
            { 
              id: "setup-website", 
              title: "Setup community website", 
              completed: false, 
              daysRequired: 7, 
              teamAssigned: "Team" 
            },
            { 
              id: "property-import", 
              title: "Import property records", 
              completed: false, 
              daysRequired: 4, 
              teamAssigned: "Team" 
            }
          ]
        }
      ]);
    } else if (projectId && projects.length > 0) {
      // Find the specific project if projectId is provided
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        setActiveProject(project);
        
        // Load project tasks and associated lead info
        loadProjectData(project.id, project.lead_id);
      }
    } else if (projects.length > 0) {
      // Just load the first project if no specific projectId
      const project = projects[0];
      setActiveProject(project);
      
      // Load project tasks and associated lead info
      loadProjectData(project.id, project.lead_id);
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
      const { data: stages } = await supabase
        .from('onboarding_stages' as any)
        .select('*')
        .order('order_index', { ascending: true });
      
      if (stages) {
        const taskGroups = stages.map((stage: any) => {
          const stageTasks = tasks.filter((task: any) => task.stage_id === stage.id);
          const completedCount = stageTasks.filter((task: any) => task.status === 'completed').length;
          
          return {
            id: stage.id,
            title: stage.name,
            description: stage.description,
            icon: <Circle className={getStageColorClass(completedCount, stageTasks.length)} />,
            completed: completedCount,
            total: stageTasks.length,
            tasks: stageTasks.map((task: any) => ({
              id: task.id,
              title: task.name,
              completed: task.status === 'completed',
              daysRequired: task.estimated_days || 1,
              teamAssigned: task.assigned_role || 'Team',
              status: task.status
            }))
          };
        });
        
        setTasksByStage(taskGroups);
      } else {
        // Fallback to demo data structure if no stages found
        setTasksByStage([
          {
            id: "initial-setup",
            title: "Setup",
            icon: <Circle className="text-blue-500 fill-blue-500" />,
            completed: 0,
            total: tasks.length,
            tasks: tasks.map((task: any) => ({
              id: task.id,
              title: task.name || "Unnamed Task",
              completed: task.status === 'completed',
              daysRequired: task.estimated_days || 1,
              teamAssigned: task.assigned_role || 'Team',
              status: task.status
            }))
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading project data:", error);
      toast.error("Failed to load project data");
    } finally {
      setIsLoading(false);
    }
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

  const metrics = calculateMetrics();

  return (
    <PageTemplate 
      title="Community Onboarding" 
      icon={<ClipboardCheck className="h-8 w-8" />}
      description="Manage the onboarding process for new communities and associations."
    >
      <div className="space-y-6">
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
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate('/lead-management/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
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
                          {stage.icon}
                          <h4 className="font-medium">{stage.title}</h4>
                        </div>
                        
                        <p className="text-xs text-muted-foreground ml-7">
                          {stage.completed} of {stage.tasks?.length || 0} tasks completed
                        </p>
                        
                        <ul className="space-y-2 ml-7 border-l pl-4">
                          {stage.tasks?.map((task: any) => (
                            <li 
                              key={task.id}
                              className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {task.title}
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
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full p-0 h-6 w-6 mr-2"
                                    onClick={() => toggleTaskStatus(task.id, task.status || (task.completed ? 'completed' : 'pending'))}
                                  >
                                    {task.completed ? (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </Button>
                                  
                                  <span className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{task.daysRequired} days</span>
                                  </div>
                                  
                                  <div className="text-sm bg-muted/40 px-2 py-1 rounded">
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
                    <Button className="flex gap-2 items-center">
                      <Upload className="h-4 w-4" />
                      Upload Document
                    </Button>
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
                          <Button size="sm" variant="outline" className="h-8">
                            Download
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
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
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default OnboardingWizard;
