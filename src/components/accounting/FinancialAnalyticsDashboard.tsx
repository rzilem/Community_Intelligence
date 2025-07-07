import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  LineChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { FinancialAnalyticsService } from '@/services/accounting/financial-analytics-service';

interface AnalyticsDashboardProps {
  associationId: string;
}

interface KPIData {
  name: string;
  value: number;
  target: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

interface CashFlowForecast {
  month: string;
  projected_income: number;
  projected_expenses: number;
  projected_balance: number;
  confidence: number;
}

const FinancialAnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ associationId }) => {
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [cashFlowForecast, setCashFlowForecast] = useState<CashFlowForecast[]>([]);
  const [agingAnalysis, setAgingAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [associationId]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock KPI data
      const mockKpis: KPIData[] = [
        {
          name: 'Collection Rate',
          value: 87.5,
          target: 95,
          change: 2.3,
          trend: 'up',
          status: 'warning'
        },
        {
          name: 'Cash Position',
          value: 125000,
          target: 100000,
          change: 15.2,
          trend: 'up',
          status: 'good'
        },
        {
          name: 'Delinquency Rate',
          value: 12.5,
          target: 5,
          change: -1.8,
          trend: 'down',
          status: 'warning'
        },
        {
          name: 'Operating Efficiency',
          value: 92.3,
          target: 90,
          change: 3.1,
          trend: 'up',
          status: 'good'
        }
      ];

      // Mock cash flow forecast
      const mockForecast: CashFlowForecast[] = [
        { month: 'Jan', projected_income: 22000, projected_expenses: 18000, projected_balance: 4000, confidence: 95 },
        { month: 'Feb', projected_income: 22500, projected_expenses: 17500, projected_balance: 9000, confidence: 90 },
        { month: 'Mar', projected_income: 21800, projected_expenses: 19200, projected_balance: 11600, confidence: 85 },
        { month: 'Apr', projected_income: 23200, projected_expenses: 18800, projected_balance: 16000, confidence: 80 },
        { month: 'May', projected_income: 22800, projected_expenses: 19500, projected_balance: 19300, confidence: 75 },
        { month: 'Jun', projected_income: 24100, projected_expenses: 20000, projected_balance: 23400, confidence: 70 }
      ];

      // Mock aging analysis
      const mockAging = [
        { category: 'Current', amount: 45000, percentage: 65 },
        { category: '1-30 Days', amount: 15000, percentage: 22 },
        { category: '31-60 Days', amount: 6000, percentage: 8 },
        { category: '61-90 Days', amount: 2500, percentage: 4 },
        { category: '90+ Days', amount: 1000, percentage: 1 }
      ];

      setKpis(mockKpis);
      setCashFlowForecast(mockForecast);
      setAgingAnalysis(mockAging);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getKPIIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Analytics</h2>
          <p className="text-muted-foreground">Advanced insights and forecasting</p>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusBadge(kpi.status)}
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.name}</p>
                    <p className={`text-2xl font-bold ${getStatusColor(kpi.status)}`}>
                      {kpi.name.includes('Rate') || kpi.name.includes('Efficiency') 
                        ? `${kpi.value}%` 
                        : formatCurrency(kpi.value)
                      }
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {getKPIIcon(kpi.trend)}
                      <span className={`text-xs ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="text-sm font-medium">
                    {kpi.name.includes('Rate') || kpi.name.includes('Efficiency') 
                      ? `${kpi.target}%` 
                      : formatCurrency(kpi.target)
                    }
                  </p>
                  <Progress 
                    value={kpi.name.includes('Delinquency') ? 100 - kpi.value : (kpi.value / kpi.target) * 100} 
                    className="h-1 mt-1" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">Cash Flow Forecast</TabsTrigger>
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Cash Flow Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="projected_income" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="Projected Income"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="projected_expenses" 
                      stackId="2"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                      name="Projected Expenses"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="projected_balance" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Net Cash Flow"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accounts Receivable Aging</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={agingAnalysis}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {agingAnalysis.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aging Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agingAnalysis.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.amount)}</p>
                        <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">+15.2%</p>
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">-5.8%</p>
                  <p className="text-sm text-muted-foreground">Expense Reduction</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <DollarSign className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">+23.4%</p>
                  <p className="text-sm text-muted-foreground">Net Income Improvement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialAnalyticsDashboard;