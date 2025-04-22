
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { ChartBar } from 'lucide-react';

// Mock data - In a real implementation, this would come from the backend
const submissionTrend = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 18 },
  { name: 'Wed', value: 24 },
  { name: 'Thu', value: 16 },
  { name: 'Fri', value: 22 },
  { name: 'Sat', value: 8 },
  { name: 'Sun', value: 6 },
];

const completionData = [
  { name: 'Completed', value: 78, color: '#10b981' },
  { name: 'Abandoned', value: 22, color: '#f43f5e' },
];

const fieldCompletionData = [
  { name: 'Name', completion: 95 },
  { name: 'Email', completion: 92 },
  { name: 'Phone', completion: 76 },
  { name: 'Address', completion: 68 },
  { name: 'Comments', completion: 45 },
];

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6'];

interface FormAnalyticsDashboardProps {
  formId?: string;
}

const FormAnalyticsDashboard: React.FC<FormAnalyticsDashboardProps> = ({ formId }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <ChartBar className="h-6 w-6 mr-2" />
        <h2 className="text-2xl font-bold">Form Analytics Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-4xl font-bold">124</CardTitle>
            <CardDescription>Total Submissions</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-4xl font-bold">78%</CardTitle>
            <CardDescription>Completion Rate</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-4xl font-bold">3:25</CardTitle>
            <CardDescription>Avg. Completion Time</CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Submissions Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submissionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Form Completion</CardTitle>
            <CardDescription>Percentage of users who complete the form</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Field Completion Rates</CardTitle>
          <CardDescription>Percentage of users who complete each field</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={fieldCompletionData}
              margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" />
              <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
              <Bar dataKey="completion" fill="#8b5cf6">
                {fieldCompletionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormAnalyticsDashboard;
