import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileBarChart, RefreshCw, CalendarIcon, Building, ChevronDown, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock financial data
const financialData = [
  { month: 'Jan', income: 42000, expenses: 30000 },
  { month: 'Feb', income: 44500, expenses: 31500 },
  { month: 'Mar', income: 44000, expenses: 30500 },
  { month: 'Apr', income: 45000, expenses: 32000 },
  { month: 'May', income: 46500, expenses: 31000 },
  { month: 'Jun', income: 48000, expenses: 31500 },
];

// Mock expenses breakdown data
const expenseData = [
  { name: 'Maintenance', value: 40, color: '#1E90FF' },
  { name: 'Utilities', value: 23, color: '#1ED8B2' },
  { name: 'Administration', value: 15, color: '#FFB347' },
  { name: 'Insurance', value: 10, color: '#FF7F50' },
  { name: 'Reserves', value: 12, color: '#B19CD9' },
];

// Mock balance report types
const balanceReportTypes = [
  { name: 'Balance Sheet - Consolidated', type: 'balance' },
  { name: 'Balance Sheet - Groups Only', type: 'balance' },
  { name: 'Balance Sheet by Fund', type: 'balance' },
  { name: 'Balance Sheet Monthly Comparison', type: 'balance' },
  { name: 'Balance Sheet Monthly Comparison (w/ Codes)', type: 'balance' },
  { name: 'Balance Sheet W/ Breakout', type: 'balance' },
];

// Mock featured reports
const featuredReports = [
  { name: 'Balance Sheet - Consolidated', icon: 'file' },
  { name: 'Financial Summary', icon: 'chart' },
  { name: 'Budget w/ Per Unit Cost (Monthly)', icon: 'chart' },
  { name: 'Bank Account Balances', icon: 'chart' },
  { name: 'Association List', icon: 'file' },
  { name: 'Work Order Summary', icon: 'file' },
];

const ReportsPage = () => {
  const [reportType, setReportType] = useState("");
  const [timePeriod, setTimePeriod] = useState("This Month");
  const [association, setAssociation] = useState("All Associations");
  const [showReportMenu, setShowReportMenu] = useState(false);
  
  return (
    <PageTemplate 
      title="Reports" 
      icon={<FileBarChart className="h-8 w-8" />}
      description="Generate, view, and manage association reports"
    >
      <div className="flex flex-col space-y-6">
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" size="sm" className="flex items-center gap-2 sm:w-auto w-full">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          
          <Button className="flex items-center gap-2 sm:w-auto w-full">
            <FileBarChart className="h-4 w-4" />
            <span>Monthly Report Workflow</span>
          </Button>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <div className="relative">
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger 
                      className="w-full"
                      onClick={() => setShowReportMenu(!showReportMenu)}
                    >
                      <div className="flex items-center gap-2">
                        <FileBarChart className="h-4 w-4" />
                        <SelectValue placeholder="Select a report" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {balanceReportTypes.map((report, index) => (
                        <SelectItem key={index} value={report.name}>
                          {report.name}
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                            {report.type}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <SelectValue placeholder="Select time period" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="This Month">This Month</SelectItem>
                    <SelectItem value="Last Month">Last Month</SelectItem>
                    <SelectItem value="This Quarter">This Quarter</SelectItem>
                    <SelectItem value="Last Quarter">Last Quarter</SelectItem>
                    <SelectItem value="Year to Date">Year to Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Association</label>
                <Select value={association} onValueChange={setAssociation}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <SelectValue placeholder="Select association" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Associations">All Associations</SelectItem>
                    <SelectItem value="Oakridge Estates">Oakridge Estates</SelectItem>
                    <SelectItem value="Lakeside Community">Lakeside Community</SelectItem>
                    <SelectItem value="Highland Towers">Highland Towers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Categories */}
        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
            <TabsTrigger value="property">Property Reports</TabsTrigger>
            <TabsTrigger value="resident">Resident Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="financial" className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expenses chart */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl">Income vs. Expenses</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis 
                        tickFormatter={(value) => `${value / 1000}k`} 
                        domain={[0, 60000]}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar dataKey="income" name="Income" fill="#4ade80" />
                      <Bar dataKey="expenses" name="Expenses" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Expense Breakdown */}
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Expense Breakdown</CardTitle>
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-sm text-gray-500">By category</p>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Cash Flow Trend</CardTitle>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-500">6-month trend</p>
                </CardHeader>
                <CardContent className="pt-4 flex justify-center">
                  <Button variant="outline" className="text-blue-600">
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Featured Reports */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Featured Reports</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredReports.map((report, index) => (
                    <Card key={index} className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {report.icon === 'file' ? (
                            <FileBarChart className="h-4 w-4" />
                          ) : (
                            <TrendingUp className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">{report.name}</span>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="property">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Property Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Property reports content will be implemented in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resident">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Resident Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Resident reports content will be implemented in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default ReportsPage;
