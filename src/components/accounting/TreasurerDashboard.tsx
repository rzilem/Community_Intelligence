import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Users,
  CreditCard
} from 'lucide-react';
import { AutomationService } from '@/services/accounting/automation-service';
import { FinancialReportingService } from '@/services/accounting/financial-reporting-service';
import { useToast } from '@/hooks/use-toast';

interface TreasurerDashboardProps {
  associationId: string;
}

interface DashboardMetrics {
  cash_position: number;
  monthly_revenue: number;
  monthly_expenses: number;
  net_income: number;
  accounts_receivable: number;
  accounts_payable: number;
  overdue_assessments: number;
  pending_approvals: number;
}

interface CriticalAlert {
  type: 'low_cash' | 'overdue_payment' | 'budget_variance' | 'approval_needed';
  message: string;
  severity: 'high' | 'medium' | 'low';
  action_required: boolean;
}

const TreasurerDashboard: React.FC<TreasurerDashboardProps> = ({ associationId }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [associationId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load financial metrics
      const [incomeStatement, balanceSheet] = await Promise.all([
        FinancialReportingService.generateIncomeStatement(
          associationId,
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ),
        FinancialReportingService.generateBalanceSheet(
          associationId,
          new Date().toISOString().split('T')[0]
        )
      ]);

      // Calculate metrics from reports
      const dashboardMetrics: DashboardMetrics = {
        cash_position: balanceSheet.assets.current_assets
          .filter(acc => acc.account_name.toLowerCase().includes('cash'))
          .reduce((sum, acc) => sum + acc.balance, 0),
        monthly_revenue: incomeStatement.revenue.total_revenue,
        monthly_expenses: incomeStatement.expenses.total_expenses,
        net_income: incomeStatement.net_income,
        accounts_receivable: balanceSheet.assets.current_assets
          .filter(acc => acc.account_name.toLowerCase().includes('receivable'))
          .reduce((sum, acc) => sum + acc.balance, 0),
        accounts_payable: balanceSheet.liabilities.current_liabilities
          .filter(acc => acc.account_name.toLowerCase().includes('payable'))
          .reduce((sum, acc) => sum + acc.balance, 0),
        overdue_assessments: 15, // Placeholder
        pending_approvals: 3 // Placeholder
      };

      setMetrics(dashboardMetrics);

      // Generate critical alerts
      const criticalAlerts: CriticalAlert[] = [];

      if (dashboardMetrics.cash_position < 10000) {
        criticalAlerts.push({
          type: 'low_cash',
          message: 'Cash position is below recommended minimum',
          severity: 'high',
          action_required: true
        });
      }

      if (dashboardMetrics.overdue_assessments > 10) {
        criticalAlerts.push({
          type: 'overdue_payment',
          message: `${dashboardMetrics.overdue_assessments} overdue assessments need attention`,
          severity: 'high',
          action_required: true
        });
      }

      if (dashboardMetrics.pending_approvals > 0) {
        criticalAlerts.push({
          type: 'approval_needed',
          message: `${dashboardMetrics.pending_approvals} transactions pending approval`,
          severity: 'medium',
          action_required: true
        });
      }

      setAlerts(criticalAlerts);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runAutomatedProcesses = async () => {
    try {
      const [recurringProcessed, assessmentsGenerated, lateFeesApplied] = await Promise.all([
        AutomationService.processRecurringEntries(associationId),
        AutomationService.processAssessmentBilling(associationId),
        AutomationService.calculateLateFees(associationId)
      ]);

      toast({
        title: "Automation Complete",
        description: `Processed ${recurringProcessed} entries, ${assessmentsGenerated} assessments, ${lateFeesApplied} late fees`
      });

      loadDashboardData(); // Refresh data
    } catch (error) {
      toast({
        title: "Automation Failed",
        description: "Failed to run automated processes",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>{alert.message}</span>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Cash Position</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics?.cash_position || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics?.monthly_revenue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics?.monthly_expenses || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-5 w-5 ${(metrics?.net_income || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className={`text-2xl font-bold ${(metrics?.net_income || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics?.net_income || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={runAutomatedProcesses} className="h-auto flex-col p-6">
              <Clock className="h-8 w-8 mb-2" />
              <span className="font-semibold">Run Automation</span>
              <span className="text-sm text-muted-foreground">Process recurring entries & assessments</span>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col p-6">
              <FileText className="h-8 w-8 mb-2" />
              <span className="font-semibold">Generate Reports</span>
              <span className="text-sm text-muted-foreground">Create financial statements</span>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col p-6">
              <Users className="h-8 w-8 mb-2" />
              <span className="font-semibold">Review Approvals</span>
              <span className="text-sm text-muted-foreground">Approve pending transactions</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="receivables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
          <TabsTrigger value="payables">Payables</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="receivables">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>30 Days</TableHead>
                    <TableHead>60 Days</TableHead>
                    <TableHead>90+ Days</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Property A</TableCell>
                    <TableCell>{formatCurrency(500)}</TableCell>
                    <TableCell>{formatCurrency(200)}</TableCell>
                    <TableCell>{formatCurrency(0)}</TableCell>
                    <TableCell>{formatCurrency(0)}</TableCell>
                    <TableCell>{formatCurrency(700)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Property B</TableCell>
                    <TableCell>{formatCurrency(0)}</TableCell>
                    <TableCell>{formatCurrency(0)}</TableCell>
                    <TableCell>{formatCurrency(300)}</TableCell>
                    <TableCell>{formatCurrency(100)}</TableCell>
                    <TableCell>{formatCurrency(400)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Maintenance Co.</TableCell>
                    <TableCell>{formatCurrency(1500)}</TableCell>
                    <TableCell>Dec 15, 2024</TableCell>
                    <TableCell><Badge>Due Soon</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Insurance Provider</TableCell>
                    <TableCell>{formatCurrency(5000)}</TableCell>
                    <TableCell>Dec 20, 2024</TableCell>
                    <TableCell><Badge variant="secondary">Scheduled</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Collection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">85%</p>
                  <p className="text-sm text-muted-foreground">Collection Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">12</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(15000)}</p>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TreasurerDashboard;