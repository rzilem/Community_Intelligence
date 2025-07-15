import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart3, Download, Calendar, Filter, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AssociationSelector from '@/components/associations/AssociationSelector';

const FinancialStatements = () => {
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');

  const balanceSheetData = {
    assets: {
      currentAssets: {
        cash: 45000,
        accountsReceivable: 12000,
        prepaidExpenses: 3000,
        total: 60000
      },
      fixedAssets: {
        equipment: 25000,
        accumulatedDepreciation: -5000,
        total: 20000
      },
      totalAssets: 80000
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable: 8000,
        accruedExpenses: 2000,
        total: 10000
      },
      longTermLiabilities: {
        loans: 15000,
        total: 15000
      },
      totalLiabilities: 25000
    },
    equity: {
      memberEquity: 30000,
      retainedEarnings: 25000,
      totalEquity: 55000
    }
  };

  const incomeStatementData = {
    revenue: {
      assessmentIncome: 48000,
      lateFeesIncome: 2400,
      interestIncome: 150,
      totalRevenue: 50550
    },
    expenses: {
      maintenance: 12000,
      landscaping: 8000,
      utilities: 6000,
      insurance: 4000,
      management: 3000,
      legal: 1500,
      administrative: 2000,
      totalExpenses: 36500
    },
    netIncome: 14050
  };

  const cashFlowData = {
    operating: {
      netIncome: 14050,
      depreciation: 1000,
      accountsReceivableChange: -2000,
      accountsPayableChange: 1500,
      operatingCashFlow: 14550
    },
    investing: {
      equipmentPurchase: -5000,
      investingCashFlow: -5000
    },
    financing: {
      loanPayments: -2000,
      financingCashFlow: -2000
    },
    netCashFlow: 7550
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <AppLayout>
      <PageTemplate 
        title="Financial Statements" 
        icon={<BarChart3 className="h-8 w-8" />}
        description="Generate and view comprehensive financial reports"
      >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AssociationSelector onAssociationChange={setSelectedAssociationId} />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="current-quarter">Current Quarter</SelectItem>
                <SelectItem value="current-year">Current Year</SelectItem>
                <SelectItem value="previous-month">Previous Month</SelectItem>
                <SelectItem value="previous-quarter">Previous Quarter</SelectItem>
                <SelectItem value="previous-year">Previous Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                  <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.assets.totalAssets)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Liabilities</p>
                  <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.liabilities.totalLiabilities)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Equity</p>
                  <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.equity.totalEquity)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Income</p>
                  <p className="text-2xl font-bold">{formatCurrency(incomeStatementData.netIncome)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Statements Tabs */}
        <Tabs defaultValue="balance-sheet" className="space-y-4">
          <TabsList>
            <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
            <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
            <TabsTrigger value="cash-flow">Cash Flow Statement</TabsTrigger>
            <TabsTrigger value="budget-variance">Budget vs Actual</TabsTrigger>
          </TabsList>

          <TabsContent value="balance-sheet" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>Assets, Liabilities, and Equity as of {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assets */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Assets</h3>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-muted-foreground">Current Assets</h4>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span>Cash and Cash Equivalents</span>
                          <span>{formatCurrency(balanceSheetData.assets.currentAssets.cash)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accounts Receivable</span>
                          <span>{formatCurrency(balanceSheetData.assets.currentAssets.accountsReceivable)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prepaid Expenses</span>
                          <span>{formatCurrency(balanceSheetData.assets.currentAssets.prepaidExpenses)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Current Assets</span>
                          <span>{formatCurrency(balanceSheetData.assets.currentAssets.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-muted-foreground">Fixed Assets</h4>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span>Equipment</span>
                          <span>{formatCurrency(balanceSheetData.assets.fixedAssets.equipment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Less: Accumulated Depreciation</span>
                          <span>{formatCurrency(balanceSheetData.assets.fixedAssets.accumulatedDepreciation)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Fixed Assets</span>
                          <span>{formatCurrency(balanceSheetData.assets.fixedAssets.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-lg font-bold border-t-2 pt-2">
                      <span>TOTAL ASSETS</span>
                      <span>{formatCurrency(balanceSheetData.assets.totalAssets)}</span>
                    </div>
                  </div>

                  {/* Liabilities and Equity */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Liabilities and Equity</h3>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-muted-foreground">Current Liabilities</h4>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span>Accounts Payable</span>
                          <span>{formatCurrency(balanceSheetData.liabilities.currentLiabilities.accountsPayable)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accrued Expenses</span>
                          <span>{formatCurrency(balanceSheetData.liabilities.currentLiabilities.accruedExpenses)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Current Liabilities</span>
                          <span>{formatCurrency(balanceSheetData.liabilities.currentLiabilities.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-muted-foreground">Long-term Liabilities</h4>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span>Loans Payable</span>
                          <span>{formatCurrency(balanceSheetData.liabilities.longTermLiabilities.loans)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Long-term Liabilities</span>
                          <span>{formatCurrency(balanceSheetData.liabilities.longTermLiabilities.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>TOTAL LIABILITIES</span>
                      <span>{formatCurrency(balanceSheetData.liabilities.totalLiabilities)}</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-muted-foreground">Member Equity</h4>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span>Member Equity</span>
                          <span>{formatCurrency(balanceSheetData.equity.memberEquity)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retained Earnings</span>
                          <span>{formatCurrency(balanceSheetData.equity.retainedEarnings)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Member Equity</span>
                          <span>{formatCurrency(balanceSheetData.equity.totalEquity)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-lg font-bold border-t-2 pt-2">
                      <span>TOTAL LIABILITIES & EQUITY</span>
                      <span>{formatCurrency(balanceSheetData.liabilities.totalLiabilities + balanceSheetData.equity.totalEquity)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income-statement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Income Statement</CardTitle>
                <CardDescription>Revenue and Expenses for the period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Revenue */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Revenue</h3>
                    <div className="pl-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Assessment Income</span>
                        <span>{formatCurrency(incomeStatementData.revenue.assessmentIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Late Fee Income</span>
                        <span>{formatCurrency(incomeStatementData.revenue.lateFeesIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest Income</span>
                        <span>{formatCurrency(incomeStatementData.revenue.interestIncome)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total Revenue</span>
                        <span>{formatCurrency(incomeStatementData.revenue.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Expenses</h3>
                    <div className="pl-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Maintenance & Repairs</span>
                        <span>{formatCurrency(incomeStatementData.expenses.maintenance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Landscaping</span>
                        <span>{formatCurrency(incomeStatementData.expenses.landscaping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utilities</span>
                        <span>{formatCurrency(incomeStatementData.expenses.utilities)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance</span>
                        <span>{formatCurrency(incomeStatementData.expenses.insurance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Management Fees</span>
                        <span>{formatCurrency(incomeStatementData.expenses.management)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Legal & Professional</span>
                        <span>{formatCurrency(incomeStatementData.expenses.legal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Administrative</span>
                        <span>{formatCurrency(incomeStatementData.expenses.administrative)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total Expenses</span>
                        <span>{formatCurrency(incomeStatementData.expenses.totalExpenses)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="flex justify-between text-lg font-bold border-t-2 pt-2">
                    <span>NET INCOME</span>
                    <span className="text-green-600">{formatCurrency(incomeStatementData.netIncome)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cash-flow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Statement</CardTitle>
                <CardDescription>Cash flows from operating, investing, and financing activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Operating Activities */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Cash Flows from Operating Activities</h3>
                    <div className="pl-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Net Income</span>
                        <span>{formatCurrency(cashFlowData.operating.netIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Depreciation</span>
                        <span>{formatCurrency(cashFlowData.operating.depreciation)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Change in Accounts Receivable</span>
                        <span>{formatCurrency(cashFlowData.operating.accountsReceivableChange)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Change in Accounts Payable</span>
                        <span>{formatCurrency(cashFlowData.operating.accountsPayableChange)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Net Cash from Operating Activities</span>
                        <span>{formatCurrency(cashFlowData.operating.operatingCashFlow)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Investing Activities */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Cash Flows from Investing Activities</h3>
                    <div className="pl-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Equipment Purchase</span>
                        <span>{formatCurrency(cashFlowData.investing.equipmentPurchase)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Net Cash from Investing Activities</span>
                        <span>{formatCurrency(cashFlowData.investing.investingCashFlow)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financing Activities */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Cash Flows from Financing Activities</h3>
                    <div className="pl-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Loan Payments</span>
                        <span>{formatCurrency(cashFlowData.financing.loanPayments)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Net Cash from Financing Activities</span>
                        <span>{formatCurrency(cashFlowData.financing.financingCashFlow)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Change in Cash */}
                  <div className="flex justify-between text-lg font-bold border-t-2 pt-2">
                    <span>NET CHANGE IN CASH</span>
                    <span className="text-green-600">{formatCurrency(cashFlowData.netCashFlow)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget-variance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Analysis</CardTitle>
                <CardDescription>Compare actual performance against budget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Budget variance analysis coming soon</p>
                  <Button className="mt-4" onClick={() => {}}>
                    Set Up Budget
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default FinancialStatements;