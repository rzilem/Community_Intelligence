import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, TrendingUp, TrendingDown, DollarSign, PieChart, 
  Calendar, AlertTriangle, CheckCircle, Target, Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdvancedGLService } from '@/services/accounting/advanced-gl-service';

interface BudgetItem {
  id: string;
  account_id: string;
  account_code: string;
  account_name: string;
  budget_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_percentage: number;
  period_start: Date;
  period_end: Date;
}

interface BudgetPeriod {
  id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  status: 'draft' | 'active' | 'closed';
  total_budget: number;
  total_actual: number;
}

interface BudgetManagementProps {
  associationId: string;
}

const BudgetManagement: React.FC<BudgetManagementProps> = ({
  associationId
}) => {
  const [budgetPeriods, setBudgetPeriods] = useState<BudgetPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<BudgetPeriod | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewPeriodDialog, setShowNewPeriodDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const { toast } = useToast();

  const [newPeriod, setNewPeriod] = useState({
    name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchBudgetPeriods();
  }, [associationId]);

  useEffect(() => {
    if (activePeriod) {
      fetchBudgetItems();
    }
  }, [activePeriod]);

  const fetchBudgetPeriods = async () => {
    // Mock data - replace with actual API call
    const mockPeriods: BudgetPeriod[] = [
      {
        id: '1',
        name: '2024 Annual Budget',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        status: 'active',
        total_budget: 500000,
        total_actual: 275000
      },
      {
        id: '2',
        name: '2025 Annual Budget',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        status: 'draft',
        total_budget: 525000,
        total_actual: 0
      }
    ];
    setBudgetPeriods(mockPeriods);
    setActivePeriod(mockPeriods[0]);
  };

  const fetchBudgetItems = async () => {
    if (!activePeriod) return;
    
    try {
      setLoading(true);
      const accounts = await AdvancedGLService.getChartOfAccounts(associationId);
      
      // Generate budget items with mock variance data
      const items: BudgetItem[] = accounts.map(account => {
        const budgetAmount = Math.random() * 50000;
        const actualAmount = account.balance;
        const varianceAmount = actualAmount - budgetAmount;
        const variancePercentage = budgetAmount ? (varianceAmount / budgetAmount) * 100 : 0;

        return {
          id: account.id,
          account_id: account.id,
          account_code: account.code,
          account_name: account.name,
          budget_amount: budgetAmount,
          actual_amount: actualAmount,
          variance_amount: varianceAmount,
          variance_percentage: variancePercentage,
          period_start: activePeriod.start_date,
          period_end: activePeriod.end_date
        };
      });

      setBudgetItems(items);
    } catch (error) {
      console.error('Failed to fetch budget items:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBudgetPeriod = async () => {
    try {
      const period: BudgetPeriod = {
        id: Date.now().toString(),
        name: newPeriod.name,
        start_date: new Date(newPeriod.start_date),
        end_date: new Date(newPeriod.end_date),
        status: 'draft',
        total_budget: 0,
        total_actual: 0
      };

      setBudgetPeriods([...budgetPeriods, period]);
      setShowNewPeriodDialog(false);
      setNewPeriod({
        name: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]
      });

      toast({
        title: "Budget Period Created",
        description: "New budget period has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create budget period.",
        variant: "destructive"
      });
    }
  };

  const updateBudgetItem = async (itemId: string, budgetAmount: number) => {
    setBudgetItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          const varianceAmount = item.actual_amount - budgetAmount;
          const variancePercentage = budgetAmount ? (varianceAmount / budgetAmount) * 100 : 0;
          return {
            ...item,
            budget_amount: budgetAmount,
            variance_amount: varianceAmount,
            variance_percentage: variancePercentage
          };
        }
        return item;
      })
    );

    toast({
      title: "Budget Updated",
      description: "Budget amount has been updated successfully."
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getVarianceColor = (percentage: number) => {
    if (Math.abs(percentage) <= 5) return 'text-green-600';
    if (Math.abs(percentage) <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVarianceIcon = (percentage: number) => {
    if (Math.abs(percentage) <= 5) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (Math.abs(percentage) <= 15) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getBudgetProgress = () => {
    if (!activePeriod) return 0;
    const now = new Date();
    const start = activePeriod.start_date;
    const end = activePeriod.end_date;
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const calculateSummary = () => {
    const totalBudget = budgetItems.reduce((sum, item) => sum + item.budget_amount, 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + item.actual_amount, 0);
    const totalVariance = totalActual - totalBudget;
    const variancePercentage = totalBudget ? (totalVariance / totalBudget) * 100 : 0;

    return { totalBudget, totalActual, totalVariance, variancePercentage };
  };

  const summary = calculateSummary();
  const budgetProgress = getBudgetProgress();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Budget Management</h2>
          <p className="text-muted-foreground">
            Create and manage budgets with variance analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewPeriodDialog(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Period
          </Button>
          <Button onClick={() => setShowBudgetDialog(true)}>
            <Target className="h-4 w-4 mr-2" />
            Budget Items
          </Button>
        </div>
      </div>

      {/* Budget Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Period</CardTitle>
          <CardDescription>Select the budget period to view and manage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={activePeriod?.id || ''}
              onValueChange={(value) => {
                const period = budgetPeriods.find(p => p.id === value);
                setActivePeriod(period || null);
              }}
            >
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Select budget period" />
              </SelectTrigger>
              <SelectContent>
                {budgetPeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    <div className="flex items-center gap-2">
                      <span>{period.name}</span>
                      <Badge variant={period.status === 'active' ? 'default' : 'secondary'}>
                        {period.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activePeriod && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {activePeriod.start_date.toDateString()} - {activePeriod.end_date.toDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Progress value={budgetProgress} className="w-32" />
                  <span className="text-sm text-muted-foreground">
                    {budgetProgress.toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {activePeriod && (
        <>
          {/* Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Budget</p>
                    <p className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Actual</p>
                    <p className="text-2xl font-bold">{formatCurrency(summary.totalActual)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Variance</p>
                    <p className={`text-2xl font-bold ${getVarianceColor(summary.variancePercentage)}`}>
                      {formatCurrency(summary.totalVariance)}
                    </p>
                  </div>
                  {summary.totalVariance >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Variance %</p>
                    <p className={`text-2xl font-bold ${getVarianceColor(summary.variancePercentage)}`}>
                      {summary.variancePercentage.toFixed(1)}%
                    </p>
                  </div>
                  <PieChart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of budget performance by account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead className="text-right">Variance %</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetItems.slice(0, 20).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.account_name}</div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {item.account_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.budget_amount)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.actual_amount)}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${getVarianceColor(item.variance_percentage)}`}>
                        {formatCurrency(item.variance_amount)}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${getVarianceColor(item.variance_percentage)}`}>
                        {item.variance_percentage.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center">
                        {getVarianceIcon(item.variance_percentage)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setShowBudgetDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* New Budget Period Dialog */}
      <Dialog open={showNewPeriodDialog} onOpenChange={setShowNewPeriodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Budget Period</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="period_name">Period Name</Label>
              <Input
                id="period_name"
                value={newPeriod.name}
                onChange={(e) => setNewPeriod({...newPeriod, name: e.target.value})}
                placeholder="e.g., 2025 Annual Budget"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newPeriod.start_date}
                  onChange={(e) => setNewPeriod({...newPeriod, start_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newPeriod.end_date}
                  onChange={(e) => setNewPeriod({...newPeriod, end_date: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewPeriodDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createBudgetPeriod}>
                Create Period
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Budget Item Edit Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit Budget - ${editingItem.account_name}` : 'Budget Items'}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>Account</Label>
                <div className="p-2 bg-muted rounded">
                  {editingItem.account_code} - {editingItem.account_name}
                </div>
              </div>
              <div>
                <Label htmlFor="budget_amount">Budget Amount</Label>
                <Input
                  id="budget_amount"
                  type="number"
                  step="0.01"
                  value={editingItem.budget_amount}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    budget_amount: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowBudgetDialog(false);
                  setEditingItem(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (editingItem) {
                    updateBudgetItem(editingItem.id, editingItem.budget_amount);
                    setShowBudgetDialog(false);
                    setEditingItem(null);
                  }
                }}>
                  Update Budget
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetManagement;