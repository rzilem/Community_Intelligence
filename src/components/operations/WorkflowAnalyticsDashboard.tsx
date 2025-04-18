import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Workflow } from '@/types/workflow-types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface WorkflowAnalyticsDashboardProps {
  activeWorkflows: Workflow[];
  workflowTemplates: Workflow[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const WorkflowAnalyticsDashboard: React.FC<WorkflowAnalyticsDashboardProps> = ({
  activeWorkflows,
  workflowTemplates
}) => {
  // Prepare data for type distribution
  const typeDistribution = React.useMemo(() => {
    const typeCounts: Record<string, number> = {};
    activeWorkflows.forEach(workflow => {
      typeCounts[workflow.type] = (typeCounts[workflow.type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [activeWorkflows]);
  
  // Prepare data for template usage
  const templateUsage = React.useMemo(() => {
    const templateCounts: Record<string, { count: number, name: string }> = {};
    
    // Create record for each template
    workflowTemplates.forEach(template => {
      templateCounts[template.id] = { count: 0, name: template.name };
    });
    
    // Count active workflows based on template
    activeWorkflows.forEach(workflow => {
      // In a real app, you'd have a template_id field to make this connection
      // This is a simplified example
      const matchingTemplate = workflowTemplates.find(
        t => t.name === workflow.name && t.type === workflow.type
      );
      
      if (matchingTemplate) {
        templateCounts[matchingTemplate.id].count += 1;
      }
    });
    
    // Convert to array and only keep templates with usage
    return Object.values(templateCounts)
      .filter(t => t.count > 0)
      .map(t => ({
        name: t.name,
        count: t.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }, [workflowTemplates, activeWorkflows]);
  
  // Completion stats
  const completionStats = React.useMemo(() => {
    let totalSteps = 0;
    let completedSteps = 0;
    
    activeWorkflows.forEach(workflow => {
      totalSteps += workflow.steps?.length || 0;
      completedSteps += workflow.steps?.filter(step => step.isComplete)?.length || 0;
    });
    
    const completionPercentage = totalSteps > 0 
      ? Math.round((completedSteps / totalSteps) * 100) 
      : 0;
      
    return {
      totalSteps,
      completedSteps,
      completionPercentage,
      pendingSteps: totalSteps - completedSteps
    };
  }, [activeWorkflows]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Active Workflows</CardTitle>
            <CardDescription>Total active workflow instances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{activeWorkflows.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Available Templates</CardTitle>
            <CardDescription>Total workflow templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{workflowTemplates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Completion Rate</CardTitle>
            <CardDescription>Steps completed vs. total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{completionStats.completionPercentage}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {completionStats.completedSteps} of {completionStats.totalSteps} steps
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Workflow Type Distribution</CardTitle>
            <CardDescription>
              Active workflows by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {typeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Most Used Templates</CardTitle>
            <CardDescription>
              Top templates by usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {templateUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={templateUsage}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" scale="band" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Usage Count" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No usage data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowAnalyticsDashboard;
