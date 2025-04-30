
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

// Mock data for GL accounts
const mockGLAccounts: GLAccount[] = [
  { id: '1000', number: '1000', name: 'First Citizens Bank Operating-X2806', type: 'Asset', balance: 0, code: '1000', description: 'First Citizens Bank Operating-X2806', category: 'Assets' },
  { id: '4000', number: '4000', name: 'Assessment Income', type: 'Revenue', balance: 0, code: '4000', description: 'Assessment Income', category: 'Income' },
  { id: '4010', number: '4010', name: 'Special Assessment', type: 'Revenue', balance: 0, code: '4010', description: 'Special Assessment', category: 'Income' },
  { id: '4100', number: '4100', name: 'Interest Income', type: 'Revenue', balance: 0, code: '4100', description: 'Interest Income', category: 'Income' },
  { id: '4110', number: '4110', name: 'Late Charge Income', type: 'Revenue', balance: 0, code: '4110', description: 'Late Charge Income', category: 'Income' },
  { id: '4115', number: '4115', name: 'Demand Letter Income', type: 'Revenue', balance: 0, code: '4115', description: 'Demand Letter Income', category: 'Income' },
  { id: '4120', number: '4120', name: 'Returned Payment Income', type: 'Revenue', balance: 0, code: '4120', description: 'Returned Payment Income', category: 'Income' },
  { id: '4130', number: '4130', name: 'Admin Fee', type: 'Revenue', balance: 0, code: '4130', description: 'Admin Fee', category: 'Income' },
  { id: '4505', number: '4505', name: 'Key Fob Income', type: 'Revenue', balance: 0, code: '4505', description: 'Key Fob Income', category: 'Income' },
  { id: '4515', number: '4515', name: 'Meeting Room Rental Income', type: 'Revenue', balance: 0, code: '4515', description: 'Meeting Room Rental Income', category: 'Income' },
  { id: '5000', number: '5000', name: 'Admin Expenses', type: 'Expense', balance: 0, code: '5000', description: 'Admin Expenses', category: 'Expenses' },
  { id: '5010', number: '5010', name: 'Bank Charges', type: 'Expense', balance: 0, code: '5010', description: 'Bank Charges', category: 'Expenses' },
  { id: '5012', number: '5012', name: 'Social Committee Expense', type: 'Expense', balance: 0, code: '5012', description: 'Social Committee Expense', category: 'Expenses' },
  { id: '5030', number: '5030', name: 'Management Fee', type: 'Expense', balance: 0, code: '5030', description: 'Management Fee', category: 'Expenses' },
  { id: '5200', number: '5200', name: 'General Repairs & Maintenance', type: 'Expense', balance: 0, code: '5200', description: 'General Repairs & Maintenance', category: 'Expenses' },
  { id: '5710', number: '5710', name: 'Landscaping Expense', type: 'Expense', balance: 0, code: '5710', description: 'Landscaping Expense', category: 'Expenses' },
  { id: '5920', number: '5920', name: 'Landscaping Contract', type: 'Expense', balance: 0, code: '5920', description: 'Landscaping Contract', category: 'Expenses' },
  { id: '6250', number: '6250', name: 'Trash', type: 'Expense', balance: 0, code: '6250', description: 'Trash', category: 'Expenses' },
  { id: '8010', number: '8010', name: 'General Liability + D&O Insurance', type: 'Expense', balance: 0, code: '8010', description: 'General Liability + D&O Insurance', category: 'Expenses' },
  { id: '9050', number: '9050', name: 'Contribution to Reserves', type: 'Expense', balance: 0, code: '9050', description: 'Contribution to Reserves', category: 'Expenses' },
];

const BudgetPlanning = () => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiInsightsLoading, setAiInsightsLoading] = useState<boolean>(false);
  
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
      accounts: mockGLAccounts.filter(a => a.type === 'Revenue' && a.number.startsWith('4') && !a.number.startsWith('45')),
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '12', 
      code: '12', 
      name: 'Other Income', 
      accounts: mockGLAccounts.filter(a => a.type === 'Revenue' && a.number.startsWith('45')),
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '13', 
      code: '13', 
      name: 'Administrative Expense', 
      accounts: mockGLAccounts.filter(a => a.type === 'Expense' && a.number.startsWith('5') && !a.number.startsWith('52') && !a.number.startsWith('57')),
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '14', 
      code: '14', 
      name: 'Repairs & Maintenance', 
      accounts: mockGLAccounts.filter(a => a.type === 'Expense' && a.number.startsWith('52')),
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '15', 
      code: '15', 
      name: 'Grounds Expense', 
      accounts: mockGLAccounts.filter(a => a.type === 'Expense' && a.number.startsWith('57')),
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '16', 
      code: '16', 
      name: 'Contracts', 
      accounts: mockGLAccounts.filter(a => a.type === 'Expense' && a.number.startsWith('59')),
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '17', 
      code: '17', 
      name: 'Utility', 
      accounts: mockGLAccounts.filter(a => a.type === 'Expense' && a.number.startsWith('62')),
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '18', 
      code: '18', 
      name: 'Insurance & Taxes', 
      accounts: mockGLAccounts.filter(a => a.type === 'Expense' && a.number.startsWith('8')),
      totalBudget: 0,
      totalPreviousYear: 0,
      change: 0,
      isExpanded: true
    },
    { 
      id: '19', 
      code: '19', 
      name: 'Reserve', 
      accounts: mockGLAccounts.filter(a => a.type === 'Expense' && a.number.startsWith('9')),
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
  
  const generateMockBudgetEntries = () => {
    setIsLoading(true);
    
    // Generate mock budget entries for all accounts
    const entries: Record<string, BudgetEntry> = {};
    
    mockGLAccounts.forEach(account => {
      // Generate mock data
      const isIncome = account.type === 'Revenue';
      const basePreviousYear = isIncome ? 
        Math.floor(Math.random() * 50000) + 5000 : 
        Math.floor(Math.random() * 30000) + 1000;
      
      const baseAnnual = isIncome ?
        basePreviousYear * (1 + (Math.random() * 0.2 - 0.1)) :
        basePreviousYear * (1 + (Math.random() * 0.3 - 0.1));
      
      // Generate monthly amounts
      const monthlyAmounts = [];
      for (let month = 1; month <= 12; month++) {
        let monthAmount = baseAnnual / 12;
        // Add some variability
        monthAmount = monthAmount * (1 + (Math.random() * 0.1 - 0.05));
        monthlyAmounts.push({
          month,
          amount: Math.round(monthAmount)
        });
      }
      
      entries[account.id] = {
        id: account.id,
        glAccountId: account.id,
        monthlyAmounts,
        annualTotal: Math.round(baseAnnual),
        previousYearActual: Math.round(basePreviousYear),
        previousYearBudget: Math.round(basePreviousYear * 0.95),
        notes: ''
      };
    });
    
    setBudgetEntries(entries);
    
    // Update group totals
    updateGroupTotals(entries);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  // Initialize with mock data
  useEffect(() => {
    generateMockBudgetEntries();
  }, []);
  
  const updateGroupTotals = (entries: Record<string, BudgetEntry>) => {
    const updatedGroups = accountGroups.map(group => {
      let totalBudget = 0;
      let totalPreviousYear = 0;
      
      group.accounts.forEach(account => {
        const entry = entries[account.id];
        if (entry) {
          totalBudget += entry.annualTotal || 0;
          totalPreviousYear += entry.previousYearActual || 0;
        }
      });
      
      return {
        ...group,
        totalBudget,
        totalPreviousYear,
        change: totalPreviousYear !== 0 ? 
          ((totalBudget - totalPreviousYear) / totalPreviousYear) * 100 : 0
      };
    });
    
    setAccountGroups(updatedGroups);
    
    // Update budget summary
    const revenueGroups = updatedGroups.filter(g => g.code.startsWith('1') && !g.code.startsWith('13') && !g.code.startsWith('14') && !g.code.startsWith('15') && !g.code.startsWith('16') && !g.code.startsWith('17') && !g.code.startsWith('18') && !g.code.startsWith('19'));
    const expenseGroups = updatedGroups.filter(g => g.code.startsWith('13') || g.code.startsWith('14') || g.code.startsWith('15') || g.code.startsWith('16') || g.code.startsWith('17') || g.code.startsWith('18') || g.code.startsWith('19'));
    
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
    
    // In a real implementation, we would fetch budget data for this association
    toast.info("Loading budget data for the selected association");
    generateMockBudgetEntries();
  };
  
  const handleBudgetFieldChange = (key: keyof Budget, value: any) => {
    setCurrentBudget(prev => ({ ...prev, [key]: value }));
    
    if (key === 'year') {
      setSelectedYear(value);
      
      // In a real implementation, we would fetch data for the selected year
      toast.info("Loading budget data for " + value);
      setTimeout(generateMockBudgetEntries, 500);
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
  
  const handleSaveBudget = () => {
    toast.success("Budget saved successfully");
  };
  
  const handleApproveBudget = () => {
    setCurrentBudget(prev => ({ ...prev, status: 'approved' }));
    toast.success("Budget approved successfully");
  };
  
  const handleUnapprove = () => {
    setCurrentBudget(prev => ({ ...prev, status: 'draft' }));
    toast.success("Budget unapproved");
  };
  
  const handleFinalize = () => {
    setCurrentBudget(prev => ({ ...prev, status: 'final' }));
    toast.success("Budget finalized and locked for future comparison reporting");
  };
  
  const handleExportBudget = () => {
    toast.success("Budget exported to Excel");
  };
  
  const handleCreateBudget = (data: any) => {
    console.log('Creating budget:', data);
    
    const newBudget: Budget = {
      id: Date.now().toString(),
      name: data.name,
      year: data.year,
      status: 'draft',
      totalRevenue: parseFloat(data.estimatedRevenue) || 0,
      totalExpenses: parseFloat(data.estimatedExpenses) || 0,
      createdBy: 'Current User', // Would come from authentication context in a real app
      createdAt: new Date().toISOString(),
      description: data.description,
      associationId: selectedAssociationId,
      fundType: 'operating'
    };
    
    setCurrentBudget(newBudget);
    setSelectedYear(data.year);
    setIsDialogOpen(false);
    
    // Generate mock data for the new budget
    generateMockBudgetEntries();
    
    toast.success("New budget created");
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
    const account = mockGLAccounts.find(a => a.number === accountNumber);
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
