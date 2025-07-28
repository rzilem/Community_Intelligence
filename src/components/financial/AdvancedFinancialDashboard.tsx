import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator, 
  BarChart3, 
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { advancedFinancialService } from '@/services/financial/advanced-financial-service';

interface AdvancedFinancialDashboardProps {
  associationId: string;
}

const AdvancedFinancialDashboard: React.FC<AdvancedFinancialDashboardProps> = ({ associationId }) => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const { data: kpis = [], isLoading: kpisLoading } = useQuery({
    queryKey: ['financial-kpis', associationId],
    queryFn: () => advancedFinancialService.getFinancialKPIs(associationId)
  });

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery({
    queryKey: ['budget-scenarios', associationId],
    queryFn: () => advancedFinancialService.getBudgetScenarios(associationId)
  });

  const { data: forecasts = [], isLoading: forecastsLoading } = useQuery({
    queryKey: ['cash-flow-forecasts', associationId],
    queryFn: () => advancedFinancialService.getCashFlowForecasts(associationId)
  });

  // Mock data for demonstration
  const mockFinancialOverview = {
    currentCashFlow: 125000,
    projectedCashFlow: 142000,
    monthlyIncome: 85000,
    monthlyExpenses: 72000,
    reserveFunds: 450000,
    collectionRate: 96.5,
    operatingExpenseRatio: 0.73,
    financialHealth: 'Excellent'
  };

  const mockKPITargets = [
    { name: 'Collection Rate', current: 96.5, target: 95, status: 'above' },
    { name: 'Operating Expense Ratio', current: 73, target: 75, status: 'below' },
    { name: 'Reserve Fund Ratio', current: 25, target: 25, status: 'on_target' },
    { name: 'Delinquency Rate', current: 3.5, target: 5, status: 'below' }
  ];

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'above': return 'text-success';
      case 'below': return 'text-warning';
      case 'on_target': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getKPIStatusIcon = (status: string) => {
    switch (status) {
      case 'above': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'below': return <TrendingDown className="h-4 w-4 text-warning" />;
      case 'on_target': return <CheckCircle className="h-4 w-4 text-primary" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (kpisLoading || scenariosLoading || forecastsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Cash Flow</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(mockFinancialOverview.currentCashFlow)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-success mr-1" />
                  <span className="text-xs text-success">+8.2%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold text-success">{mockFinancialOverview.collectionRate}%</p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 text-success mr-1" />
                  <span className="text-xs text-success">Above target</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reserve Funds</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(mockFinancialOverview.reserveFunds)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">25% of annual budget</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Financial Health</p>
                <p className="text-2xl font-bold text-success">{mockFinancialOverview.financialHealth}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">Score: 92/100</span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Key Performance Indicators
          </CardTitle>
          <CardDescription>Track performance against financial targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockKPITargets.map((kpi) => (
              <div key={kpi.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{kpi.name}</span>
                  <div className="flex items-center gap-2">
                    {getKPIStatusIcon(kpi.status)}
                    <span className={`font-bold ${getKPIStatusColor(kpi.status)}`}>
                      {kpi.current}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(kpi.current / kpi.target) * 100} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Target: {kpi.target}%</span>
                  <span>
                    {kpi.current > kpi.target ? '+' : ''}
                    {(kpi.current - kpi.target).toFixed(1)}% vs target
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="forecasting" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasting">Cash Flow Forecasting</TabsTrigger>
          <TabsTrigger value="scenarios">Budget Scenarios</TabsTrigger>
          <TabsTrigger value="analytics">Financial Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>12-Month Cash Flow Forecast</CardTitle>
                <CardDescription>Projected cash flow for the next 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => {
                    const month = new Date();
                    month.setMonth(month.getMonth() + i);
                    const projected = 125000 + (Math.random() - 0.5) * 20000;
                    
                    return (
                      <div key={i} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">
                            {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            Confidence: {Math.round(95 - i * 5)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{formatCurrency(projected)}</span>
                          <div className="flex items-center justify-end">
                            {projected > 120000 ? (
                              <ArrowUpRight className="h-3 w-3 text-success" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-warning" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecast Accuracy</CardTitle>
                <CardDescription>Historical forecast performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Last Month Accuracy</span>
                    <Badge variant="outline" className="bg-success/10 text-success">98.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>3-Month Average</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary">96.7%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>12-Month Average</span>
                    <Badge variant="outline" className="bg-warning/10 text-warning">94.3%</Badge>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Key Forecast Drivers</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Assessment collection patterns</li>
                      <li>• Seasonal maintenance costs</li>
                      <li>• Utility expense trends</li>
                      <li>• Reserve fund allocations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Best Case Scenario</h3>
                  <Badge className="bg-success/10 text-success">+15% Revenue</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Projected Income</span>
                    <span className="font-medium">{formatCurrency(97750)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Net Surplus</span>
                    <span className="font-medium text-success">{formatCurrency(25750)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Current Trajectory</h3>
                  <Badge className="bg-primary/10 text-primary">Baseline</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Projected Income</span>
                    <span className="font-medium">{formatCurrency(85000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Net Surplus</span>
                    <span className="font-medium text-primary">{formatCurrency(13000)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Worst Case Scenario</h3>
                  <Badge className="bg-destructive/10 text-destructive">-10% Revenue</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Projected Income</span>
                    <span className="font-medium">{formatCurrency(76500)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Net Surplus</span>
                    <span className="font-medium text-destructive">{formatCurrency(4500)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Scenario Analysis Tools</CardTitle>
              <CardDescription>Create and analyze custom budget scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">What-If Analysis</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Calculator className="h-4 w-4 mr-2" />
                      Assessment Increase Impact
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Expense Reduction Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Emergency Expense Impact
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Scenario Templates</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <PieChart className="h-4 w-4 mr-2" />
                      Major Capital Project
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Utility Cost Increase
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="h-4 w-4 mr-2" />
                      Seasonal Adjustment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Category Analysis</CardTitle>
                <CardDescription>Breakdown of expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Maintenance & Repairs', amount: 28000, percentage: 39 },
                    { category: 'Utilities', amount: 18000, percentage: 25 },
                    { category: 'Insurance', amount: 12000, percentage: 17 },
                    { category: 'Administrative', amount: 8000, percentage: 11 },
                    { category: 'Landscaping', amount: 6000, percentage: 8 }
                  ].map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm">{formatCurrency(item.amount)} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Trends</CardTitle>
                <CardDescription>Year-over-year performance trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <span className="font-medium">Revenue Growth</span>
                      <p className="text-sm text-muted-foreground">vs. last year</p>
                    </div>
                    <div className="text-right">
                      <span className="text-success font-bold">+5.2%</span>
                      <div className="flex items-center justify-end">
                        <TrendingUp className="h-3 w-3 text-success" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <span className="font-medium">Expense Control</span>
                      <p className="text-sm text-muted-foreground">vs. budget</p>
                    </div>
                    <div className="text-right">
                      <span className="text-primary font-bold">-2.1%</span>
                      <div className="flex items-center justify-end">
                        <TrendingDown className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <span className="font-medium">Net Income Margin</span>
                      <p className="text-sm text-muted-foreground">improvement</p>
                    </div>
                    <div className="text-right">
                      <span className="text-success font-bold">+7.3%</span>
                      <div className="flex items-center justify-end">
                        <TrendingUp className="h-3 w-3 text-success" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Automation</CardTitle>
              <CardDescription>Automated financial processes and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Active Automations</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">Monthly Assessment Bills</span>
                        <p className="text-sm text-muted-foreground">Auto-generated on 1st</p>
                      </div>
                      <Badge className="bg-success/10 text-success">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">Late Fee Processing</span>
                        <p className="text-sm text-muted-foreground">Applied after 30 days</p>
                      </div>
                      <Badge className="bg-success/10 text-success">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">Budget Variance Alerts</span>
                        <p className="text-sm text-muted-foreground">When {'>'}10% over budget</p>
                      </div>
                      <Badge className="bg-success/10 text-success">Active</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Available Automations</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="h-4 w-4 mr-2" />
                      Recurring Journal Entries
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Cash Flow Alerts
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calculator className="h-4 w-4 mr-2" />
                      Monthly Financial Reports
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedFinancialDashboard;