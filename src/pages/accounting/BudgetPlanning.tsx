
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PiggyBank, Plus, CalendarPlus, ChartBar, FileText, Settings } from 'lucide-react';
import AssociationSelector from '@/components/associations/AssociationSelector';
import BudgetTable from '@/components/budgeting/BudgetTable';
import BudgetDialog from '@/components/budgeting/BudgetDialog';

const BudgetPlanning = () => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(undefined);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());
  
  // Mock budgets data
  const [budgets, setBudgets] = useState([
    {
      id: '1',
      name: 'Annual Operating Budget',
      year: '2025',
      status: 'draft',
      totalRevenue: 250000,
      totalExpenses: 225000,
      createdBy: 'John Smith',
      createdAt: '2025-01-15T10:30:00Z',
      description: 'Annual operating budget for general association expenses'
    },
    {
      id: '2',
      name: 'Reserve Fund Budget',
      year: '2025',
      status: 'approved',
      totalRevenue: 100000,
      totalExpenses: 75000,
      createdBy: 'Jane Doe',
      createdAt: '2025-01-20T14:45:00Z',
      description: 'Budget for the reserve fund to cover major repairs and replacements'
    },
    {
      id: '3',
      name: 'Capital Improvement Budget',
      year: '2024',
      status: 'final',
      totalRevenue: 150000,
      totalExpenses: 145000,
      createdBy: 'John Smith',
      createdAt: '2024-01-10T09:15:00Z',
      description: 'Special budget for planned capital improvements to community facilities'
    },
    {
      id: '4',
      name: 'Special Assessment Budget',
      year: '2024',
      status: 'draft',
      totalRevenue: 75000,
      totalExpenses: 70000,
      createdBy: 'Jane Doe', 
      createdAt: '2024-02-05T11:20:00Z',
      description: 'Budget for special assessment to repair clubhouse roof'
    }
  ]);

  const handleAssociationChange = (associationId: string) => {
    console.log('Association changed to:', associationId);
    setSelectedAssociationId(associationId);
    // In a real implementation, we would fetch budgets for this association
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = 
      budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = selectedYear === 'all' || budget.year === selectedYear;
    
    return matchesSearch && matchesYear;
  });

  const handleCreateBudget = (data: any) => {
    console.log('Creating budget:', data);
    
    const newBudget = {
      id: Date.now().toString(),
      name: data.name,
      year: data.year,
      status: 'draft',
      totalRevenue: parseFloat(data.estimatedRevenue) || 0,
      totalExpenses: parseFloat(data.estimatedExpenses) || 0,
      createdBy: 'Current User', // Would come from authentication context in a real app
      createdAt: new Date().toISOString(),
      description: data.description
    };
    
    setBudgets([newBudget, ...budgets]);
    setIsDialogOpen(false);
  };

  const handleEditBudget = (budget: any) => {
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };

  const handleUpdateBudget = (data: any) => {
    if (!selectedBudget) return;
    
    const updatedBudget = {
      ...selectedBudget,
      name: data.name,
      year: data.year,
      totalRevenue: parseFloat(data.estimatedRevenue) || 0,
      totalExpenses: parseFloat(data.estimatedExpenses) || 0,
      description: data.description
    };
    
    setBudgets(budgets.map(budget => 
      budget.id === selectedBudget.id ? updatedBudget : budget
    ));
    
    setSelectedBudget(undefined);
    setIsDialogOpen(false);
  };

  const handleViewDetails = (budget: any) => {
    console.log('Viewing budget details:', budget);
    // In a real implementation, we would navigate to a detailed view
  };

  return (
    <PageTemplate 
      title="Budget Planning" 
      icon={<PiggyBank className="h-8 w-8" />}
      description="Create and manage annual budgets for community associations."
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Budget Planning</CardTitle>
              <CardDescription>Create and manage association budgets and forecasts</CardDescription>
            </div>
            <AssociationSelector 
              className="md:self-end" 
              onAssociationChange={handleAssociationChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Search budgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" /> Reports
              </Button>
              
              <Button variant="outline">
                <ChartBar className="h-4 w-4 mr-2" /> Compare
              </Button>
              
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Button>

              <Button onClick={() => {
                setSelectedBudget(undefined);
                setIsDialogOpen(true);
              }}>
                <CalendarPlus className="h-4 w-4 mr-2" /> Create Budget
              </Button>
            </div>
          </div>

          <BudgetTable 
            budgets={filteredBudgets}
            onEdit={handleEditBudget}
            onView={handleViewDetails}
          />

          <BudgetDialog 
            isOpen={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);
              setSelectedBudget(undefined);
            }}
            onSubmit={selectedBudget ? handleUpdateBudget : handleCreateBudget}
            budget={selectedBudget}
            years={years}
          />
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default BudgetPlanning;
