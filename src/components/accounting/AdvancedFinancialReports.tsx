import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, TrendingUp, DollarSign, Calendar, Filter } from 'lucide-react';
import { AdvancedGLService } from '@/services/accounting/advanced-gl-service';

interface FinancialReportData {
  reportType: string;
  periodStart: Date;
  periodEnd: Date;
  data: any[];
  totals: Record<string, number>;
  generatedAt: Date;
}

interface AdvancedFinancialReportsProps {
  associationId: string;
}

const AdvancedFinancialReports: React.FC<AdvancedFinancialReportsProps> = ({
  associationId
}) => {
  const [reportType, setReportType] = useState('balance_sheet');
  const [periodStart, setPeriodStart] = useState<Date>(new Date(new Date().getFullYear(), 0, 1));
  const [periodEnd, setPeriodEnd] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState<'none' | 'previous_year' | 'previous_period'>('none');

  const reportTypes = [
    { value: 'balance_sheet', label: 'Balance Sheet', icon: DollarSign },
    { value: 'income_statement', label: 'Income Statement', icon: TrendingUp },
    { value: 'cash_flow', label: 'Cash Flow Statement', icon: FileText },
    { value: 'trial_balance', label: 'Trial Balance', icon: Calendar },
    { value: 'budget_variance', label: 'Budget vs Actual', icon: Filter },
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      let data;
      switch (reportType) {
        case 'balance_sheet':
          data = await generateBalanceSheet();
          break;
        case 'income_statement':
          data = await generateIncomeStatement();
          break;
        case 'cash_flow':
          data = await generateCashFlowStatement();
          break;
        case 'trial_balance':
          data = await generateTrialBalance();
          break;
        case 'budget_variance':
          data = await generateBudgetVariance();
          break;
        default:
          throw new Error('Unknown report type');
      }
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateBalanceSheet = async (): Promise<FinancialReportData> => {
    const accounts = await AdvancedGLService.getChartOfAccounts(associationId);
    
    const assets = accounts.filter(acc => acc.type === 'asset');
    const liabilities = accounts.filter(acc => acc.type === 'liability');
    const equity = accounts.filter(acc => acc.type === 'equity');

    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);

    return {
      reportType: 'Balance Sheet',
      periodStart,
      periodEnd,
      data: [
        { section: 'Assets', accounts: assets, total: totalAssets },
        { section: 'Liabilities', accounts: liabilities, total: totalLiabilities },
        { section: 'Equity', accounts: equity, total: totalEquity }
      ],
      totals: {
        assets: totalAssets,
        liabilities: totalLiabilities,
        equity: totalEquity,
        check: totalAssets - (totalLiabilities + totalEquity)
      },
      generatedAt: new Date()
    };
  };

  const generateIncomeStatement = async (): Promise<FinancialReportData> => {
    const accounts = await AdvancedGLService.getChartOfAccounts(associationId);
    
    const revenue = accounts.filter(acc => acc.type === 'revenue');
    const expenses = accounts.filter(acc => acc.type === 'expense');

    const totalRevenue = revenue.reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      reportType: 'Income Statement',
      periodStart,
      periodEnd,
      data: [
        { section: 'Revenue', accounts: revenue, total: totalRevenue },
        { section: 'Expenses', accounts: expenses, total: totalExpenses }
      ],
      totals: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netIncome
      },
      generatedAt: new Date()
    };
  };

  const generateTrialBalance = async (): Promise<FinancialReportData> => {
    const trialBalance = await AdvancedGLService.generateTrialBalance(
      associationId,
      periodEnd.toISOString().split('T')[0]
    );

    const totalDebits = trialBalance.reduce((sum, acc) => sum + acc.debit_balance, 0);
    const totalCredits = trialBalance.reduce((sum, acc) => sum + acc.credit_balance, 0);

    return {
      reportType: 'Trial Balance',
      periodStart,
      periodEnd,
      data: trialBalance,
      totals: {
        debits: totalDebits,
        credits: totalCredits,
        difference: totalDebits - totalCredits
      },
      generatedAt: new Date()
    };
  };

  const generateCashFlowStatement = async (): Promise<FinancialReportData> => {
    // Simplified cash flow - would need more sophisticated logic in production
    const accounts = await AdvancedGLService.getChartOfAccounts(associationId);
    const cashAccounts = accounts.filter(acc => acc.name.toLowerCase().includes('cash'));
    
    return {
      reportType: 'Cash Flow Statement',
      periodStart,
      periodEnd,
      data: [
        { section: 'Operating Activities', items: [], total: 0 },
        { section: 'Investing Activities', items: [], total: 0 },
        { section: 'Financing Activities', items: [], total: 0 }
      ],
      totals: {
        operating: 0,
        investing: 0,
        financing: 0,
        netCashFlow: 0
      },
      generatedAt: new Date()
    };
  };

  const generateBudgetVariance = async (): Promise<FinancialReportData> => {
    const accounts = await AdvancedGLService.getChartOfAccounts(associationId);
    
    const varianceData = accounts.map(acc => ({
      ...acc,
      budget_amount: acc.budget_amount || 0,
      variance_amount: acc.balance - (acc.budget_amount || 0),
      variance_percentage: acc.budget_amount ? 
        ((acc.balance - acc.budget_amount) / acc.budget_amount) * 100 : 0
    }));

    return {
      reportType: 'Budget vs Actual',
      periodStart,
      periodEnd,
      data: varianceData,
      totals: {
        actualTotal: varianceData.reduce((sum, acc) => sum + acc.balance, 0),
        budgetTotal: varianceData.reduce((sum, acc) => sum + (acc.budget_amount || 0), 0),
        varianceTotal: varianceData.reduce((sum, acc) => sum + acc.variance_amount, 0)
      },
      generatedAt: new Date()
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const exportReport = () => {
    if (!reportData) return;
    
    // Create CSV export
    const csvData = convertToCSV(reportData);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.reportType.replace(/\s+/g, '_')}_${periodEnd.toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: FinancialReportData): string => {
    // Simplified CSV conversion - would be more sophisticated in production
    let csv = `${data.reportType}\n`;
    csv += `Period: ${data.periodStart.toDateString()} to ${data.periodEnd.toDateString()}\n\n`;
    
    if (Array.isArray(data.data)) {
      data.data.forEach((section: any) => {
        csv += `${section.section || 'Data'}\n`;
        if (section.accounts) {
          section.accounts.forEach((acc: any) => {
            csv += `${acc.code},${acc.name},${acc.balance}\n`;
          });
        }
        csv += `Total: ${section.total || 0}\n\n`;
      });
    }
    
    return csv;
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportData.reportType) {
      case 'Balance Sheet':
        return renderBalanceSheet();
      case 'Income Statement':
        return renderIncomeStatement();
      case 'Trial Balance':
        return renderTrialBalance();
      case 'Budget vs Actual':
        return renderBudgetVariance();
      default:
        return <div>Report content not implemented</div>;
    }
  };

  const renderBalanceSheet = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {reportData.data.map((section: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{section.section}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {section.accounts.map((account: any) => (
                  <div key={account.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm">{account.code}</span>
                      <span>{account.name}</span>
                    </div>
                    <span className="font-mono">{formatCurrency(account.balance)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total {section.section}</span>
                  <span className="font-mono">{formatCurrency(section.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between text-lg font-bold">
              <span>Balance Check (Should be 0)</span>
              <span className={`font-mono ${Math.abs(reportData.totals.check) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(reportData.totals.check)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderIncomeStatement = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {reportData.data.map((section: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{section.section}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {section.accounts.map((account: any) => (
                  <div key={account.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm">{account.code}</span>
                      <span>{account.name}</span>
                    </div>
                    <span className="font-mono">{formatCurrency(account.balance)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total {section.section}</span>
                  <span className="font-mono">{formatCurrency(section.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between text-xl font-bold">
              <span>Net Income</span>
              <span className={`font-mono ${reportData.totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(reportData.totals.netIncome)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTrialBalance = () => {
    if (!reportData) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance</CardTitle>
          <CardDescription>
            As of {periodEnd.toDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 font-bold border-b pb-2">
              <span>Account</span>
              <span>Name</span>
              <span className="text-right">Debit</span>
              <span className="text-right">Credit</span>
            </div>
            {reportData.data.map((account: any, index: number) => (
              <div key={index} className="grid grid-cols-4 gap-4 py-1">
                <span className="font-mono text-sm">{account.account_code}</span>
                <span>{account.account_name}</span>
                <span className="text-right font-mono">
                  {account.debit_balance > 0 ? formatCurrency(account.debit_balance) : ''}
                </span>
                <span className="text-right font-mono">
                  {account.credit_balance > 0 ? formatCurrency(account.credit_balance) : ''}
                </span>
              </div>
            ))}
            <Separator />
            <div className="grid grid-cols-4 gap-4 font-bold">
              <span></span>
              <span>Totals</span>
              <span className="text-right font-mono">{formatCurrency(reportData.totals.debits)}</span>
              <span className="text-right font-mono">{formatCurrency(reportData.totals.credits)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBudgetVariance = () => {
    if (!reportData) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual Analysis</CardTitle>
          <CardDescription>
            For period {periodStart.toDateString()} to {periodEnd.toDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-4 font-bold border-b pb-2">
              <span>Account</span>
              <span>Name</span>
              <span className="text-right">Budget</span>
              <span className="text-right">Actual</span>
              <span className="text-right">Variance</span>
              <span className="text-right">%</span>
            </div>
            {reportData.data.map((account: any, index: number) => (
              <div key={index} className="grid grid-cols-6 gap-4 py-1">
                <span className="font-mono text-sm">{account.code}</span>
                <span>{account.name}</span>
                <span className="text-right font-mono">{formatCurrency(account.budget_amount)}</span>
                <span className="text-right font-mono">{formatCurrency(account.balance)}</span>
                <span className={`text-right font-mono ${account.variance_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(account.variance_amount)}
                </span>
                <span className={`text-right font-mono ${account.variance_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {account.variance_percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">
            Generate comprehensive financial statements and analysis reports
          </p>
        </div>
        {reportData && (
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Period Start</Label>
              <Input
                type="date"
                value={periodStart.toISOString().split('T')[0]}
                onChange={(e) => setPeriodStart(new Date(e.target.value))}
              />
            </div>

            <div>
              <Label>Period End</Label>
              <Input
                type="date"
                value={periodEnd.toISOString().split('T')[0]}
                onChange={(e) => setPeriodEnd(new Date(e.target.value))}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{reportData.reportType}</CardTitle>
                <CardDescription>
                  Generated on {reportData.generatedAt.toLocaleString()}
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {periodStart.toDateString()} - {periodEnd.toDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderReportContent()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedFinancialReports;