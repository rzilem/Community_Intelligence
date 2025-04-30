
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PieChart, Pie, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Workflow, WorkflowType } from '@/types/workflow-types';

interface WorkflowAnalyticsDashboardProps {
  activeWorkflows: Workflow[];
  workflowTemplates: Workflow[];
}

const WorkflowAnalyticsDashboard: React.FC<WorkflowAnalyticsDashboardProps> = ({ 
  activeWorkflows,
  workflowTemplates
}) => {
  const [timeRange, setTimeRange] = React.useState('month');

  // Calculate workflow type distribution data
  const workflowTypeData = React.useMemo(() => {
    const typeCount: Record<string, number> = {};
    
    activeWorkflows.forEach(workflow => {
      if (typeCount[workflow.type]) {
        typeCount[workflow.type]++;
      } else {
        typeCount[workflow.type] = 1;
      }
    });
    
    return Object.keys(typeCount).map(type => ({
      type,
      count: typeCount[type],
      color: getColorForType(type as WorkflowType)
    }));
  }, [activeWorkflows]);

  // Calculate workflow status data
  const statusData = React.useMemo(() => {
    const active = activeWorkflows.filter(w => w.status === 'active').length;
    const inactive = activeWorkflows.filter(w => w.status === 'inactive').length;
    const draft = activeWorkflows.filter(w => w.status === 'draft').length;
    
    return [
      { name: 'Active', value: active, color: '#22c55e' },
      { name: 'Paused', value: inactive, color: '#f59e0b' },
      { name: 'Draft', value: draft, color: '#94a3b8' }
    ];
  }, [activeWorkflows]);

  // Calculate template usage data
  const templateUsageData = React.useMemo(() => {
    const templateUsageCount: Record<string, number> = {};
    
    // Count how many times each template is used
    workflowTemplates.forEach(template => {
      templateUsageCount[template.name] = 0;
    });
    
    // Count usage based on workflow name match (simplified example)
    activeWorkflows.forEach(workflow => {
      const matchingTemplate = workflowTemplates.find(t => 
        workflow.name.includes(t.name) || t.name.includes(workflow.name)
      );
      if (matchingTemplate) {
        templateUsageCount[matchingTemplate.name]++;
      }
    });
    
    return Object.keys(templateUsageCount)
      .map(name => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        count: templateUsageCount[name]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }, [workflowTemplates, activeWorkflows]);

  // Dummy data for completion time trends
  const completionTimeData = [
    { month: 'Jan', avgDays: 5 },
    { month: 'Feb', avgDays: 6 },
    { month: 'Mar', avgDays: 4 },
    { month: 'Apr', avgDays: 3 },
    { month: 'May', avgDays: 5 },
    { month: 'Jun', avgDays: 7 }
  ];

  // Helper function to get color for workflow type
  function getColorForType(type: WorkflowType): string {
    const colorMap: Record<WorkflowType, string> = {
      'Financial': '#8884d8',
      'Compliance': '#82ca9d',
      'Maintenance': '#ffc658',
      'Resident Management': '#ff8042',
      'Governance': '#0088fe',
      'Communication': '#00C49F'
    };
    
    return colorMap[type] || '#999';
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflow Analytics</h2>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkflows.length}</div>
            <p className="text-xs text-muted-foreground">
              {workflowTemplates.length} templates available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeWorkflows.filter(w => w.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeWorkflows.filter(w => w.status === 'active').length / Math.max(1, activeWorkflows.length)) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.2 days</div>
            <p className="text-xs text-muted-foreground">
              -12% from previous {timeRange}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +5% from previous {timeRange}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Workflow by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workflowTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="type"
                    label={({type, count}) => `${type}: ${count}`}
                  >
                    {workflowTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Completion Time Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgDays" 
                    name="Avg. Completion Days" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Most Used Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={templateUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Usage Count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowAnalyticsDashboard;
