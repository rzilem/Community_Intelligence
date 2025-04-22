
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, BarChart, Wallet, Calendar, DollarSign, ArrowRight, Download, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssociationSelector from '@/components/associations/AssociationSelector';
import TreasurerDashboard from '@/components/dashboard/TreasurerDashboard';
import { Button } from '@/components/ui/button';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line } from 'recharts';
import { useResponsive } from '@/hooks/use-responsive';

const FinancialDashboardPage = () => {
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { isMobile } = useResponsive();
  
  // Mock data for the charts
  const monthlyExpenseData = [
    { month: 'Jan', actual: 7500, budget: 8000 },
    { month: 'Feb', actual: 8200, budget: 8000 },
    { month: 'Mar', actual: 7800, budget: 8000 },
    { month: 'Apr', actual: 8100, budget: 8000 },
    { month: 'May', actual: 9200, budget: 8500 },
    { month: 'Jun', actual: 8900, budget: 8500 },
    { month: 'Jul', actual: 8300, budget: 8500 },
    { month: 'Aug', actual: 8600, budget: 8500 },
    { month: 'Sep', actual: 8100, budget: 8500 },
    { month: 'Oct', actual: 8400, budget: 9000 },
    { month: 'Nov', actual: 9200, budget: 9000 },
    { month: 'Dec', actual: 9800, budget: 9000 },
  ];
  
  const quarterlyAssessmentData = [
    { quarter: 'Q1', collected: 48500, total: 50000 },
    { quarter: 'Q2', collected: 49200, total: 50000 },
    { quarter: 'Q3', collected: 47800, total: 50000 },
    { quarter: 'Q4', collected: 48900, total: 50000 },
  ];
  
  const expenseBreakdownData = [
    { category: 'Landscaping', percentage: 28 },
    { category: 'Maintenance', percentage: 22 },
    { category: 'Utilities', percentage: 18 },
    { category: 'Admin', percentage: 12 },
    { category: 'Insurance', percentage: 10 },
    { category: 'Reserves', percentage: 10 },
  ];

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  return (
    <PageTemplate 
      title="Financial Dashboard" 
      icon={<Wallet className="h-8 w-8" />}
      description="A comprehensive view of your association's financial health"
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <AssociationSelector 
            className="w-full md:w-[250px]" 
            onAssociationChange={handleAssociationChange}
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`${isMobile ? 'w-full grid grid-cols-3' : ''}`}>
            <TabsTrigger value="overview" className={isMobile ? 'flex-1' : ''}>Overview</TabsTrigger>
            <TabsTrigger value="income" className={isMobile ? 'flex-1' : ''}>Income</TabsTrigger>
            <TabsTrigger value="expenses" className={isMobile ? 'flex-1' : ''}>Expenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Operating Fund</p>
                        <h3 className="text-2xl font-bold">$98,452</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reserve Fund</p>
                        <h3 className="text-2xl font-bold">$175,320</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">YTD Income</p>
                        <h3 className="text-2xl font-bold">$201,475</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">YTD Expenses</p>
                        <h3 className="text-2xl font-bold">$187,289</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Monthly Expense Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expenses vs Budget</CardTitle>
                  <CardDescription>Comparison of actual expenses against budgeted amounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={monthlyExpenseData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Bar dataKey="actual" name="Actual" fill="#8884d8" />
                        <Bar dataKey="budget" name="Budget" fill="#82ca9d" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quarterly Collections */}
              <Card>
                <CardHeader>
                  <CardTitle>Quarterly Assessment Collections</CardTitle>
                  <CardDescription>Collection rate of assessments by quarter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={quarterlyAssessmentData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Line type="monotone" dataKey="collected" name="Collected" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="total" name="Total Due" stroke="#82ca9d" />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Expense Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>Distribution of expenses by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenseBreakdownData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.category}</span>
                          <span className="text-sm font-medium">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Financial Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Financial Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Assessment Payment</p>
                          <p className="text-sm text-muted-foreground">123 Main St, Unit 101</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+$450.00</p>
                        <p className="text-sm text-muted-foreground">Apr 18, 2023</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Landscaping Service</p>
                          <p className="text-sm text-muted-foreground">Monthly maintenance</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">-$1,250.00</p>
                        <p className="text-sm text-muted-foreground">Apr 15, 2023</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Utility Payment</p>
                          <p className="text-sm text-muted-foreground">Common area electricity</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">-$380.00</p>
                        <p className="text-sm text-muted-foreground">Apr 12, 2023</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Assessment Payment</p>
                          <p className="text-sm text-muted-foreground">456 Park Ave, Unit 201</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+$450.00</p>
                        <p className="text-sm text-muted-foreground">Apr 10, 2023</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Late Fee</p>
                          <p className="text-sm text-muted-foreground">789 Oak St, Unit 301</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+$25.00</p>
                        <p className="text-sm text-muted-foreground">Apr 8, 2023</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      View All Transactions <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="income">
            <TreasurerDashboard />
          </TabsContent>
          
          <TabsContent value="expenses">
            <TreasurerDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default FinancialDashboardPage;
