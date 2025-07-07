
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PiggyBank, 
  ChartBar, 
  FileText, 
  Settings, 
  CalendarPlus, 
  Sparkles,
  Download,
  Upload
} from 'lucide-react';
import BudgetEditor from '@/components/budgeting/BudgetEditor';
import BudgetDialog from '@/components/budgeting/BudgetDialog';
import BudgetSettings from '@/components/budgeting/BudgetSettings';
import BudgetAIInsights from '@/components/budgeting/BudgetAIInsights';
import { 
  Budget, 
  GLAccount, 
  GLAccountGroup, 
  BudgetEntry,
  BudgetPrediction,
  BudgetSummary
} from '@/types/accounting-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdvancedGLService } from '@/services/accounting/advanced-gl-service';
import { BudgetService } from '@/services/accounting/budget-service';

const BudgetPlanning = () => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('demo-association-id');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [aiInsightsLoading, setAiInsightsLoading] = useState<boolean>(false);
  const [glAccounts, setGLAccounts] = useState<GLAccount[]>([]);
  
  // The current budget being edited
  const [currentBudget, setCurrentBudget] = useState<Budget>({
    id: '1',
    name: 'Annual Operating Budget',
    year: new Date().getFullYear().toString(),
    status: 'draft',
    totalRevenue: 0,
    totalExpenses: 0,
    createdBy: 'Current User',
    createdAt: new Date().toISOString(),
    description: 'Annual operating budget for general association expenses',
    associationId: '',
    fundType: 'operating'
  });
  
  // State for GL account grouping
  const [accountGroups, setAccountGroups] = useState<GLAccountGroup[]>([
    { 
      id: '10', 
      code: '10', 
      name: 'Income', 
      accounts: [],
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '12', 
      code: '12', 
      name: 'Other Income', 
      accounts: [],
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '13', 
      code: '13', 
      name: 'Administrative Expense', 
      accounts: [],
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '14', 
      code: '14', 
      name: 'Repairs & Maintenance', 
      accounts: [],
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '15', 
      code: '15', 
      name: 'Grounds Expense', 
      accounts: [],
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '16', 
      code: '16', 
      name: 'Contracts', 
      accounts: [],
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '17', 
      code: '17', 
      name: 'Utility', 
      accounts: [],
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '18', 
      code: '18', 
      name: 'Insurance & Taxes', 
      accounts: [],
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '19', 
      code: '19', 
      name: 'Reserve', 
      accounts: [],
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
  ]);
  
  // Budget entries for the current budget
  const [budgetEntries, setBudgetEntries] = useState<Record<string, BudgetEntry>>({});
  
  // AI predictions
  const [aiPredictions, setAiPredictions] = useState<BudgetPrediction[]>([
    {
      glAccountId: '5200 - General Repairs & Maintenance',
      suggestedAmount: 10000,
      confidence: 0.85,
      reasoning: "Based on historical data, spending in this category has been trending higher than budgeted for the past 3 years."
    },
    {
      glAccountId: '5710 - Landscaping Expense',
      suggestedAmount: 40000,
      confidence: 0.92,
      reasoning: "Landscaping costs in the area have increased by an average of 7% this year."
    },
    {
      glAccountId: '6250 - Trash',
      suggestedAmount: 1600,
      confidence: 0.78,
      reasoning: "Local waste management services have announced a 5% rate increase for the coming year."
    }
  ]);
  
  // Budget summary
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    totalRevenue: 550795,
    totalExpenses: 550795,
    netIncome: 0,
    previousYearTotalRevenue: 670149.71,
    previousYearTotalExpenses: 913226.23,
    previousYearNetIncome: -243076.52,
    revenueChange: -17.81,
    expenseChange: -39.69,
    netIncomeChange: 100
  });
  
  // Initialize data loading
  useEffect(() => {
    if (selectedAssociationId) {
      loadBudgetData();
    }
  }, [selectedAssociationId, selectedYear]);

  const loadBudgetData = async () => {
    try {
      setIsLoading(true);
      
      // Load GL Accounts
      const accounts = await AdvancedGLService.getChartOfAccounts(selectedAssociationId);
      setGLAccounts(accounts.map(acc => ({
        id: acc.id,
        number: acc.code,
        name: acc.name,
        type: acc.category === 'Assets' || acc.category === 'Liabilities' || acc.category === 'Equity' ? 'Asset' : 
              acc.category === 'Income' || acc.category === 'Revenue' ? 'Revenue' : 'Expense',
        balance: acc.balance || 0,
        code: acc.code,
        description: acc.description || acc.name,
        category: acc.category
      })));

      // Try to load existing budget (placeholder for now)
      /*
      try {
        const existingBudget = await BudgetService.getBudgetByYear(selectedAssociationId, selectedYear);
        if (existingBudget) {
          setCurrentBudget(existingBudget);
          const entries = await BudgetService.getBudgetEntries(existingBudget.id, selectedAssociationId);
          const entriesMap: Record<string, BudgetEntry> = {};
          entries.forEach(entry => {
            entriesMap[entry.gl_account_id] = {
              id: entry.id,
              glAccountId: entry.gl_account_id,
              monthlyAmounts: entry.monthly_amounts || [],
              annualTotal: entry.annual_total || 0,
              previousYearActual: entry.previous_year_actual || 0,
              previousYearBudget: entry.previous_year_budget || 0,
              notes: entry.notes || ''
            };
          });
          setBudgetEntries(entriesMap);
        }
      } catch (error) {
        // No existing budget, create a new one
        console.log('No existing budget found, using template');
      }
      */

      updateGroupTotals(budgetEntries);
    } catch (error) {
      console.error('Error loading budget data:', error);
      toast.error('Failed to load budget data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroupTotals = (entries: Record<string, BudgetEntry>) => {
    const updatedGroups = accountGroups.map(group => {
      let totalBudget = 0;
      let totalPreviousYear = 0;
      
      // Update accounts based on loaded GL accounts
      const updatedAccounts = glAccounts.filter(account => {
        switch (group.id) {
          case '10': return account.type === 'Revenue' && account.number.startsWith('4') && !account.number.startsWith('45');
          case '12': return account.type === 'Revenue' && account.number.startsWith('45');
          case '13': return account.type === 'Expense' && account.number.startsWith('5') && !account.number.startsWith('52') && !account.number.startsWith('57');
          case '14': return account.type === 'Expense' && account.number.startsWith('52');
          case '15': return account.type === 'Expense' && account.number.startsWith('57');
          case '16': return account.type === 'Expense' && account.number.startsWith('59');
          case '17': return account.type === 'Expense' && account.number.startsWith('62');
          case '18': return account.type === 'Expense' && account.number.startsWith('8');
          case '19': return account.type === 'Expense' && account.number.startsWith('9');
          default: return false;
        }
      });

      updatedAccounts.forEach(account => {
        const entry = entries[account.id];
        if (entry) {
          totalBudget += entry.annualTotal || 0;
          totalPreviousYear += entry.previousYearActual || 0;
        }
      });
      
      return {
        ...group,
        accounts: updatedAccounts,
        totalBudget,
        totalPreviousYear,
        change: totalPreviousYear !== 0 ? 
          ((totalBudget - totalPreviousYear) / totalPreviousYear) * 100 : 0
      };
    });
    
    setAccountGroups(updatedGroups);
    
    // Update budget summary
    const revenueGroups = updatedGroups.filter(g => ['10', '12'].includes(g.id));
    const expenseGroups = updatedGroups.filter(g => ['13', '14', '15', '16', '17', '18', '19'].includes(g.id));
    
    const totalRevenue = revenueGroups.reduce((sum, group) => sum + group.totalBudget, 0);
    const totalExpenses = expenseGroups.reduce((sum, group) => sum + group.totalBudget, 0);
    const prevYearRevenue = revenueGroups.reduce((sum, group) => sum + group.totalPreviousYear, 0);
    const prevYearExpenses = expenseGroups.reduce((sum, group) => sum + group.totalPreviousYear, 0);
    
    setBudgetSummary({
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      previousYearTotalRevenue: prevYearRevenue,
      previousYearTotalExpenses: prevYearExpenses,
      previousYearNetIncome: prevYearRevenue - prevYearExpenses,
      revenueChange: prevYearRevenue !== 0 ? ((totalRevenue - prevYearRevenue) / prevYearRevenue) * 100 : 0,
      expenseChange: prevYearExpenses !== 0 ? ((totalExpenses - prevYearExpenses) / prevYearExpenses) * 100 : 0,
      netIncomeChange: (prevYearRevenue - prevYearExpenses) !== 0 ? 
        ((totalRevenue - totalExpenses) - (prevYearRevenue - prevYearExpenses)) / Math.abs(prevYearRevenue - prevYearExpenses) * 100 : 0
    });
    
    // Update budget totals
    setCurrentBudget(prev => ({
      ...prev,
      totalRevenue,
      totalExpenses
    }));
  };
  
  const handleBudgetChange = (glAccountId: string, month: number, amount: number) => {
    setBudgetEntries(prev => {
      const entry = prev[glAccountId] || {
        id: glAccountId,
        glAccountId,
        monthlyAmounts: [],
        annualTotal: 0,
        previousYearActual: 0
      };
      
      // Find the monthly amount or create new one
      const monthIndex = entry.monthlyAmounts.findIndex(m => m.month === month);
      const updatedMonthlyAmounts = [...entry.monthlyAmounts];
      
      if (monthIndex >= 0) {
        updatedMonthlyAmounts[monthIndex] = { ...updatedMonthlyAmounts[monthIndex], amount };
      } else {
        updatedMonthlyAmounts.push({ month, amount });
      }
      
      // Calculate annual total
      const annualTotal = updatedMonthlyAmounts.reduce((sum, month) => sum + month.amount, 0);
      
      const updatedEntry = {
        ...entry,
        monthlyAmounts: updatedMonthlyAmounts,
        annualTotal
      };
      
      const updatedEntries = { ...prev, [glAccountId]: updatedEntry };
      
      // Update group totals on the next render
      setTimeout(() => updateGroupTotals(updatedEntries), 0);
      
      return updatedEntries;
    });
  };
  
  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
    setCurrentBudget(prev => ({ ...prev, associationId }));
    
    toast.info("Loading budget data for the selected association");
    loadBudgetData();
  };
  
  const handleBudgetFieldChange = (key: keyof Budget, value: any) => {
    setCurrentBudget(prev => ({ ...prev, [key]: value }));
    
    if (key === 'year') {
      setSelectedYear(value);
      
      toast.info("Loading budget data for " + value);
      setTimeout(() => loadBudgetData(), 500);
    }
  };
  
  const handleGroupToggle = (groupId: string) => {
    setAccountGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, isExpanded: !group.isExpanded } 
          : group
      )
    );
  };
  
  const handleSaveBudget = async () => {
    try {
      setIsLoading(true);
      // Placeholder for budget service integration
      // await BudgetService.saveBudget(currentBudget, Object.values(budgetEntries));
      toast.success("Budget saved successfully");
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error("Failed to save budget");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveBudget = async () => {
    try {
      // await BudgetService.updateBudgetStatus(currentBudget.id, 'approved');
      setCurrentBudget(prev => ({ ...prev, status: 'approved' }));
      toast.success("Budget approved successfully");
    } catch (error) {
      console.error('Error approving budget:', error);
      toast.error("Failed to approve budget");
    }
  };

  const handleUnapprove = async () => {
    try {
      // await BudgetService.updateBudgetStatus(currentBudget.id, 'draft');
      setCurrentBudget(prev => ({ ...prev, status: 'draft' }));
      toast.success("Budget unapproved");
    } catch (error) {
      console.error('Error unapproving budget:', error);
      toast.error("Failed to change budget status");
    }
  };

  const handleFinalize = async () => {
    try {
      // await BudgetService.updateBudgetStatus(currentBudget.id, 'final');
      setCurrentBudget(prev => ({ ...prev, status: 'final' }));
      toast.success("Budget finalized and locked for future comparison reporting");
    } catch (error) {
      console.error('Error finalizing budget:', error);
      toast.error("Failed to finalize budget");
    }
  };
  
  const handleExportBudget = () => {
    toast.success("Budget exported to Excel");
  };
  
  const handleCreateBudget = async (data: any) => {
    try {
      setIsLoading(true);
      
      const newBudget: Budget = {
        id: Date.now().toString(),
        name: data.name,
        year: data.year,
        status: 'draft',
        totalRevenue: parseFloat(data.estimatedRevenue) || 0,
        totalExpenses: parseFloat(data.estimatedExpenses) || 0,
        createdBy: 'Current User',
        createdAt: new Date().toISOString(),
        description: data.description,
        associationId: selectedAssociationId,
        fundType: 'operating'
      };
      
      // const savedBudget = await BudgetService.createBudget(newBudget);
      setCurrentBudget(newBudget);
      setSelectedYear(data.year);
      setIsDialogOpen(false);
      
      // Load fresh data for the new budget
      loadBudgetData();
      
      toast.success("New budget created");
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error("Failed to create budget");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateAIInsights = () => {
    setAiInsightsLoading(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      toast.success("AI analysis generated");
      setAiInsightsLoading(false);
    }, 2000);
  };
  
  const handleApplyAISuggestion = (prediction: BudgetPrediction) => {
    // Extract the GL account ID from the prediction
    const parts = prediction.glAccountId.split(' - ');
    const accountNumber = parts[0];
    
    // Find the account
    const account = glAccounts.find(a => a.number === accountNumber);
    if (!account) return;
    
    // Update the budget entry
    const suggestedMonthlyAmount = prediction.suggestedAmount / 12;
    
    // Apply the monthly amounts
    for (let month = 1; month <= 12; month++) {
      handleBudgetChange(account.id, month, Math.round(suggestedMonthlyAmount));
    }
    
    toast.success(`Applied AI suggestion for ${prediction.glAccountId}`);
  };
  
  const handleApplyAllSuggestions = () => {
    aiPredictions.forEach(handleApplyAISuggestion);
    toast.success("Applied all AI suggestions");
  };
  
  const handleGenerateAIReport = () => {
    toast.success("Generating AI analysis report...");
    setTimeout(() => {
      toast.success("AI analysis report ready for download");
    }, 2000);
  };
  
  const handleImportFinancialReport = () => {
    toast.info("Upload a financial report to analyze");
    setTimeout(() => {
      toast.success("AI will analyze your report and suggest GL code mappings");
    }, 1500);
  };

  return (
    <PageTemplate 
      title="Budget Planning" 
      icon={<PiggyBank className="h-8 w-8" />}
      description="Create and manage detailed operating, reserve, and capital budgets."
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:items-center justify-between">
                <div>
                  <CardTitle>Budget Editor</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {currentBudget.name} | {currentBudget.year} | {currentBudget.status.charAt(0).toUpperCase() + currentBudget.status.slice(1)}
                  </p>
                </div>
                <div className="flex flex-wrap space-x-2">
                  <Button variant="outline" size="sm" onClick={handleImportFinancialReport}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <ChartBar className="h-4 w-4 mr-2" />
                    Compare
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => setIsDialogOpen(true)} size="sm">
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    New Budget
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="flex flex-col items-center">
                    <div className="border-4 border-t-primary border-primary/30 w-10 h-10 rounded-full animate-spin mb-3"></div>
                    <p className="text-muted-foreground">Loading budget data...</p>
                  </div>
                </div>
              ) : (
                <BudgetEditor 
                  glAccountGroups={accountGroups}
                  budgetEntries={budgetEntries}
                  year={selectedYear}
                  previousYear={(parseInt(selectedYear) - 1).toString()}
                  isEditable={currentBudget.status !== 'final'}
                  aiPredictions={aiPredictions}
                  onBudgetChange={handleBudgetChange}
                  onGroupToggle={handleGroupToggle}
                  onApplyAISuggestion={handleApplyAISuggestion}
                />
              )}
              
              <div className="mt-4 flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Balance:</p>
                  <p className={`text-xl font-bold ${budgetSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {budgetSummary.netIncome.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Revenue − Expenses</p>
                  <p className="text-sm">
                    {budgetSummary.totalRevenue.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0
                    })} − {budgetSummary.totalExpenses.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <BudgetSettings 
            budget={currentBudget}
            onBudgetChange={handleBudgetFieldChange}
            onAssociationChange={handleAssociationChange}
            onSave={handleSaveBudget}
            onApprove={handleApproveBudget}
            onUnapprove={handleUnapprove}
            onFinalize={handleFinalize}
            onExport={handleExportBudget}
            isApproved={currentBudget.status === 'approved' || currentBudget.status === 'final'}
            isFinalized={currentBudget.status === 'final'}
          />
          
          {aiInsightsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <span>Analyzing budget data...</span>
                  </div>
                  <div className="border-4 border-t-primary border-primary/30 w-8 h-8 rounded-full animate-spin"></div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <BudgetAIInsights 
              budgetSummary={budgetSummary}
              predictions={aiPredictions}
              onApplyAllSuggestions={handleApplyAllSuggestions}
              onGenerateReport={handleGenerateAIReport}
            />
          )}
          
          {!aiInsightsLoading && (
            <Button 
              onClick={handleGenerateAIInsights} 
              className="w-full"
              variant="outline"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Refresh AI Insights
            </Button>
          )}
        </div>
      </div>

      <BudgetDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateBudget}
        budget={undefined}
        years={Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString())}
      />
    </PageTemplate>
  );
};

export default BudgetPlanning;
