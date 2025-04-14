
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, DollarSign, Percent, Clock, AlertCircle } from 'lucide-react';
import { useResponsive } from '@/hooks/use-responsive';
import { ResponsiveContainer } from 'recharts';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer as RechartsResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TreasurerDashboard: React.FC = () => {
  const { isMobile } = useResponsive();
  
  // Mock data for the charts
  const collectionRateData = [
    { month: 'Jan', rate: 94 },
    { month: 'Feb', rate: 96 },
    { month: 'Mar', rate: 92 },
    { month: 'Apr', rate: 97 },
    { month: 'May', rate: 95 },
    { month: 'Jun', rate: 98 },
    { month: 'Jul', rate: 96 },
    { month: 'Aug', rate: 93 },
    { month: 'Sep', rate: 92 },
    { month: 'Oct', rate: 90 },
    { month: 'Nov', rate: 95 },
    { month: 'Dec', rate: 97 },
  ];
  
  const budgetVsActualData = [
    { category: 'Landscaping', budget: 15000, actual: 14200 },
    { category: 'Maintenance', budget: 24000, actual: 26500 },
    { category: 'Admin', budget: 8000, actual: 7800 },
    { category: 'Utilities', budget: 18000, actual: 19200 },
    { category: 'Insurance', budget: 12000, actual: 12000 },
    { category: 'Reserves', budget: 30000, actual: 30000 },
  ];
  
  const expenseBreakdownData = [
    { name: 'Landscaping', value: 14200 },
    { name: 'Maintenance', value: 26500 },
    { name: 'Admin', value: 7800 },
    { name: 'Utilities', value: 19200 },
    { name: 'Insurance', value: 12000 },
    { name: 'Reserves', value: 30000 },
  ];
  
  const accountBalanceTrendData = [
    { month: 'Jan', operating: 75000, reserve: 120000 },
    { month: 'Feb', operating: 72000, reserve: 125000 },
    { month: 'Mar', operating: 68000, reserve: 130000 },
    { month: 'Apr', operating: 82000, reserve: 135000 },
    { month: 'May', operating: 78000, reserve: 140000 },
    { month: 'Jun', operating: 86000, reserve: 145000 },
    { month: 'Jul', operating: 84000, reserve: 150000 },
    { month: 'Aug', operating: 89000, reserve: 155000 },
    { month: 'Sep', operating: 92000, reserve: 160000 },
    { month: 'Oct', operating: 88000, reserve: 165000 },
    { month: 'Nov', operating: 94000, reserve: 170000 },
    { month: 'Dec', operating: 98000, reserve: 175000 },
  ];
  
  const delinquentAccountsData = [
    { type: '30-60 Days', count: 12, amount: 9600 },
    { type: '60-90 Days', count: 8, amount: 6400 },
    { type: '90+ Days', count: 5, amount: 4000 },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Financial Dashboard</h2>
          <p className="text-muted-foreground">
            Financial health overview for treasurers and financial managers
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Financial Report
        </Button>
      </div>
      
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operating Fund</p>
                <h3 className="text-2xl font-bold">$98,000</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+4.3%</span>
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reserve Fund</p>
                <h3 className="text-2xl font-bold">$175,000</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+2.9%</span>
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                <h3 className="text-2xl font-bold">97%</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Percent className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+2.1%</span>
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delinquent Accounts</p>
                <h3 className="text-2xl font-bold">25</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">-12%</span>
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Collection Rate Trend */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Collection Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RechartsResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={collectionRateData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </RechartsResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Budget vs Actual */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Budget vs Actual Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RechartsResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetVsActualData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                  <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                </BarChart>
              </RechartsResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Expense Breakdown */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RechartsResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </RechartsResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Balance Trend */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Account Balance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RechartsResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={accountBalanceTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="operating"
                    stroke="#8884d8"
                    name="Operating Fund"
                  />
                  <Line
                    type="monotone"
                    dataKey="reserve"
                    stroke="#82ca9d"
                    name="Reserve Fund"
                  />
                </LineChart>
              </RechartsResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delinquent Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Delinquent Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Delinquency</th>
                  <th className="text-left p-2">Number of Accounts</th>
                  <th className="text-left p-2">Total Amount</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {delinquentAccountsData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.type}</td>
                    <td className="p-2">{item.count}</td>
                    <td className="p-2">${item.amount.toLocaleString()}</td>
                    <td className="p-2">
                      <Button variant="outline" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreasurerDashboard;
