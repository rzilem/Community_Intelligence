
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { ClipboardCheck, ChevronDown, ChevronUp, CheckCircle, Circle, Clock, Calendar, Users, ArrowLeft, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  daysRequired: number;
  teamAssigned: string;
}

interface SetupCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  completed: number;
}

const OnboardingWizard = () => {
  const [activeHOA, setActiveHOA] = useState({
    name: "Sunset Valley HOA",
    startDate: "5/1/2023",
    progress: {
      completed: 2,
      total: 7
    },
    daysSinceStart: 708,
    daysRemaining: 1437,
    clientAccess: "Active"
  });

  const [setupCategories, setSetupCategories] = useState<SetupCategory[]>([
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

  const totalCompletedTasks = setupCategories.reduce((acc, category) => 
    acc + category.tasks.filter(task => task.completed).length, 0);
  
  const totalTasks = setupCategories.reduce((acc, category) => 
    acc + category.tasks.length, 0);

  const progressPercentage = (totalCompletedTasks / totalTasks) * 100;

  const toggleTaskStatus = (categoryId: string, taskId: string) => {
    setSetupCategories(prevCategories => 
      prevCategories.map(category => {
        if (category.id === categoryId) {
          const updatedTasks = category.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed };
            }
            return task;
          });
          
          const completedCount = updatedTasks.filter(task => task.completed).length;
          
          return {
            ...category,
            tasks: updatedTasks,
            completed: completedCount
          };
        }
        return category;
      })
    );
  };

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
            <h2 className="text-2xl font-bold">{activeHOA.name}</h2>
            <p className="text-muted-foreground">Started {activeHOA.startDate}</p>
          </div>
          
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button variant="outline" className="flex items-center gap-2">
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
                  {activeHOA.progress.completed} of {activeHOA.progress.total} tasks completed
                </p>
                <Progress value={progressPercentage} className="h-2 mt-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium">{totalCompletedTasks} tasks</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-md">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Days Since Start</p>
                    <p className="font-medium">{activeHOA.daysSinceStart} days</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Days Remaining</p>
                    <p className="font-medium">{activeHOA.daysRemaining} days</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-md">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client Access</p>
                    <p className="font-medium">{activeHOA.clientAccess}</p>
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
                    {setupCategories.map((category) => (
                      <div key={category.id} className="space-y-3">
                        <div className="flex items-center gap-2">
                          {category.icon}
                          <h4 className="font-medium">{category.title}</h4>
                        </div>
                        
                        <p className="text-xs text-muted-foreground ml-7">
                          {category.completed} of {category.tasks.length} tasks completed
                        </p>
                        
                        <ul className="space-y-2 ml-7 border-l pl-4">
                          {category.tasks.map(task => (
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
                    {setupCategories.map((category) => (
                      <AccordionItem 
                        key={category.id} 
                        value={category.id}
                        className="border rounded-md"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20">
                          <div className="flex flex-col sm:flex-row sm:items-center w-full">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{category.title}</span>
                            </div>
                            <span className="text-sm text-muted-foreground ml-0 sm:ml-2">
                              {category.completed} of {category.tasks.length} tasks completed
                            </span>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="pt-2">
                          <div className="space-y-2">
                            {category.tasks.map(task => (
                              <div 
                                key={task.id} 
                                className="border rounded-md p-4 flex justify-between items-center"
                              >
                                <div className="flex items-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full p-0 h-6 w-6 mr-2"
                                    onClick={() => toggleTaskStatus(category.id, task.id)}
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
              <CardContent className="pt-6">
                <p>Document management for the onboarding process will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sharing">
            <Card>
              <CardContent className="pt-6">
                <p>Client sharing settings and permissions will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default OnboardingWizard;
