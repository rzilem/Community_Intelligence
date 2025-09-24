import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Home, 
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Target,
  Zap
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';

interface BusinessIntelligenceDashboardProps {
  associationId: string;
}

const BusinessIntelligenceDashboard: React.FC<BusinessIntelligenceDashboardProps> = ({ associationId }) => {
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  const [kpis, setKpis] = useState({
    totalRevenue: 125000,
    revenueGrowth: 12.5,
    activeResidents: 156,
    occupancyRate: 94.2,
    avgCollectionTime: 8.5,
    delinquencyRate: 2.1,
    maintenanceRequests: 23,
    resolutionTime: 3.2
  });

  const [revenueData] = useState([
    { month: 'Jul', revenue: 18000, expenses: 12000, profit: 6000 },
    { month: 'Aug', revenue: 22000, expenses: 14000, profit: 8000 },
    { month: 'Sep', revenue: 19000, expenses: 13000, profit: 6000 },
    { month: 'Oct', revenue: 25000, expenses: 15000, profit: 10000 },
    { month: 'Nov', revenue: 21000, expenses: 13500, profit: 7500 },
    { month: 'Dec', revenue: 20000, expenses: 12500, profit: 7500 }
  ]);

  const [expenseBreakdown] = useState([
    { name: 'Maintenance', value: 35, color: '#8b5cf6' },
    { name: 'Utilities', value: 25, color: '#06b6d4' },
    { name: 'Insurance', value: 15, color: '#10b981' },
    { name: 'Management', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 10, color: '#ef4444' }
  ]);

  const [collectionTrends] = useState([
    { week: 'Week 1', collected: 85, pending: 10, delinquent: 5 },
    { week: 'Week 2', collected: 88, pending: 8, delinquent: 4 },
    { week: 'Week 3', collected: 82, pending: 12, delinquent: 6 },
    { week: 'Week 4', collected: 90, pending: 7, delinquent: 3 }
  ]);

  const [predictiveInsights] = useState([
    {
      id: 1,
      type: 'revenue',
      title: 'Revenue Forecast',
      prediction: 'Expected 8% increase next quarter',
      confidence: 87,
      impact: 'high',
      recommendation: 'Consider increasing reserve funds'
    },
    {
      id: 2,
      type: 'maintenance',
      title: 'Maintenance Costs',
      prediction: 'HVAC systems may need replacement within 6 months',
      confidence: 73,
      impact: 'medium',
      recommendation: 'Schedule preventive maintenance'
    },
    {
      id: 3,
      type: 'occupancy',
      title: 'Occupancy Trends',
      prediction: 'Slight decrease expected during summer months',
      confidence: 65,
      impact: 'low',
      recommendation: 'Plan marketing campaigns'
    }
  ]);

  // Mock data loading
  useEffect(() => {
    // Simulate data loading
    console.log('Loading business intelligence data for:', associationId, dateRange);
  }, [associationId, dateRange]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const exportReport = () => {
    console.log('Exporting report...');
  };

  return (
    <AppLayout>
      <PageTemplate
        title="Business Intelligence"
        icon={<BarChart3 className="h-8 w-8 text-purple-500" />}
        description="Executive dashboard with key performance indicators"
        actions={
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last90days">Last 90 days</SelectItem>
                <SelectItem value="last12months">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      +{kpis.revenueGrowth}% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Residents</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpis.activeResidents}</div>
                    <p className="text-xs text-muted-foreground">
                      {kpis.occupancyRate}% occupancy rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(100 - kpis.delinquencyRate).toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      Avg collection time: {kpis.avgCollectionTime} days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpis.maintenanceRequests}</div>
                    <p className="text-xs text-muted-foreground">
                      Avg resolution: {kpis.resolutionTime} days
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsBarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="revenue" fill="#8b5cf6" />
                      <Bar dataKey="expenses" fill="#f59e0b" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collection Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={collectionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="collected" stackId="a" fill="#10b981" />
                      <Bar dataKey="pending" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="delinquent" stackId="a" fill="#ef4444" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      AI-Powered Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {predictiveInsights.map((insight) => (
                        <div key={insight.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{insight.prediction}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Confidence: {insight.confidence}%
                            </span>
                            <span className="text-xs font-medium text-blue-600">
                              {insight.recommendation}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default BusinessIntelligenceDashboard;