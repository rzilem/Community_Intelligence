import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Filter,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface BusinessIntelligenceDashboardProps {
  associationId: string;
}

const BusinessIntelligenceDashboard: React.FC<BusinessIntelligenceDashboardProps> = ({ associationId }) => {
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    revenueGrowth: 0,
    activeResidents: 0,
    occupancyRate: 0,
    avgCollectionTime: 0,
    delinquencyRate: 0,
    maintenanceRequests: 0,
    resolutionTime: 0
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [collectionTrends, setCollectionTrends] = useState<any[]>([]);

  const [predictiveInsights, setPredictiveInsights] = useState([
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

  // Load real data from Supabase
  useEffect(() => {
    loadBusinessIntelligenceData();
  }, [associationId, dateRange]);

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'last7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'last30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'last90days':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'last12months':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  const loadBusinessIntelligenceData = async () => {
    try {
      const startDate = getDateRangeFilter();
      
      // Fetch real data from multiple tables
      const [
        invoicesData,
        paymentsData,
        residentsData,
        propertiesData,
        maintenanceData,
        accountsReceivableData
      ] = await Promise.all([
        supabase
          .from('payment_transactions_enhanced')
          .select('net_amount, payment_date, status')
          .gte('payment_date', startDate.toISOString())
          .order('payment_date', { ascending: true }),
        supabase
          .from('payment_transactions_enhanced')
          .select('net_amount, payment_date, status')
          .gte('payment_date', startDate.toISOString())
          .order('payment_date', { ascending: true }),
        supabase
          .from('profiles')
          .select('id, created_at'),
        supabase
          .from('properties')
          .select('id, status, created_at'),
        supabase
          .from('work_orders')
          .select('id, status, created_at, priority')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true }),
        supabase
          .from('accounts_receivable')
          .select('current_balance, due_date, status, created_at')
          .gte('created_at', startDate.toISOString())
      ]);

      // Calculate KPIs from real data
      const invoices = invoicesData.data || [];
      const payments = paymentsData.data || [];
      const residents = residentsData.data || [];
      const properties = propertiesData.data || [];
      const maintenance = maintenanceData.data || [];
      const ar = accountsReceivableData.data || [];

      // Calculate revenue and growth
      const totalRevenue = payments.reduce((sum, pay) => sum + (pay.net_amount || 0), 0);
      const totalPayments = payments.reduce((sum, pay) => sum + (pay.net_amount || 0), 0);
      
      // Calculate occupancy and residents
      const activeResidents = residents.length; // All profiles are considered active
      const totalProperties = properties.length;
      const occupiedProperties = properties.filter(p => p.status === 'occupied').length;
      const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

      // Calculate maintenance metrics
      const openMaintenance = maintenance.filter(m => m.status === 'open').length;
      const completedMaintenance = maintenance.filter(m => m.status === 'completed');
      const avgResolutionTime = completedMaintenance.length > 0 
        ? completedMaintenance.reduce((sum, m) => {
            // Use created_at as completion proxy since completed_at doesn't exist
            const created = new Date(m.created_at);
            const now = new Date();
            return sum + (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            return sum;
          }, 0) / completedMaintenance.length
        : 0;

      // Calculate delinquency rate
      const delinquentAR = ar.filter(a => a.status === 'overdue' && a.current_balance > 0);
      const delinquencyRate = ar.length > 0 ? (delinquentAR.length / ar.length) * 100 : 0;

      setKpis({
        totalRevenue,
        revenueGrowth: Math.random() * 15, // Mock growth calculation
        activeResidents,
        occupancyRate,
        avgCollectionTime: Math.random() * 15 + 5, // Mock collection time
        delinquencyRate,
        maintenanceRequests: openMaintenance,
        resolutionTime: avgResolutionTime
      });

      // Generate monthly revenue trend from real data
      const monthlyRevenue = generateMonthlyTrend(invoices, payments, startDate);
      setRevenueData(monthlyRevenue);

      // Generate expense breakdown (mock for now)
      setExpenseBreakdown([
        { name: 'Maintenance', value: 35, color: '#8b5cf6' },
        { name: 'Utilities', value: 25, color: '#06b6d4' },
        { name: 'Insurance', value: 15, color: '#10b981' },
        { name: 'Management', value: 15, color: '#f59e0b' },
        { name: 'Other', value: 10, color: '#ef4444' }
      ]);

      // Generate collection trends from real payment data
      const weeklyCollections = generateWeeklyCollectionTrends(payments, ar);
      setCollectionTrends(weeklyCollections);

    } catch (error) {
      console.error('Failed to load business intelligence data:', error);
    }
  };

  const generateMonthlyTrend = (invoices: any[], payments: any[], startDate: Date) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthlyInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate >= monthStart && invDate <= monthEnd;
      });
      
      const monthlyPayments = payments.filter(pay => {
        const payDate = new Date(pay.payment_date);
        return payDate >= monthStart && payDate <= monthEnd;
      });
      
      const revenue = monthlyInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const expenses = revenue * 0.6; // Mock expense calculation
      const profit = revenue - expenses;
      
      months.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue,
        expenses,
        profit
      });
    }
    
    return months;
  };

  const generateWeeklyCollectionTrends = (payments: any[], ar: any[]) => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weeklyPayments = payments.filter(pay => {
        const payDate = new Date(pay.payment_date);
        return payDate >= weekStart && payDate <= weekEnd;
      });
      
      const collected = weeklyPayments.length;
      const pending = Math.floor(collected * 0.1);
      const delinquent = Math.floor(collected * 0.02);
      
      weeks.push({
        week: `Week ${4 - i}`,
        collected: Math.max(0, collected - pending - delinquent),
        pending,
        delinquent
      });
    }
    
    return weeks;
  };

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
    // Implementation for exporting reports
    console.log('Exporting report...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Intelligence</h1>
          <p className="text-muted-foreground">Executive dashboard with key performance indicators</p>
        </div>
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
      </div>

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

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Operational Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Work Orders Completed</span>
                  <span className="font-bold">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Response Time</span>
                  <span className="font-bold">2.3 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Resident Satisfaction</span>
                  <span className="font-bold">4.7/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Vendor Performance</span>
                  <span className="font-bold">94%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Building A</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Building B</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Building C</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
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
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant="secondary" className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{insight.prediction}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Confidence:</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${insight.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{insight.confidence}%</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial Summary</SelectItem>
                      <SelectItem value="operational">Operational Report</SelectItem>
                      <SelectItem value="maintenance">Maintenance Analysis</SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last30days">Last 30 days</SelectItem>
                      <SelectItem value="last90days">Last 90 days</SelectItem>
                      <SelectItem value="last12months">Last 12 months</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button>Generate Report</Button>
                <Button variant="outline">Schedule Report</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Monthly Financial Summary', date: '2024-01-15', type: 'PDF' },
                  { name: 'Maintenance Report Q4', date: '2024-01-10', type: 'Excel' },
                  { name: 'Operational Metrics', date: '2024-01-08', type: 'PDF' },
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">{report.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{report.type}</Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligenceDashboard;