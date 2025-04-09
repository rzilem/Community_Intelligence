
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Edit2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Budget {
  id: string;
  name: string;
  year: string;
  status: 'draft' | 'approved' | 'final';
  totalRevenue: number;
  totalExpenses: number;
  createdBy: string;
  createdAt: string;
  description: string;
}

interface BudgetTableProps {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onView: (budget: Budget) => void;
}

const BudgetTable: React.FC<BudgetTableProps> = ({ budgets, onEdit, onView }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'final':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  const calculateSurplusDeficit = (revenue: number, expenses: number) => {
    const difference = revenue - expenses;
    const formattedValue = formatCurrency(Math.abs(difference));
    
    if (difference > 0) {
      return <span className="text-green-600">{formattedValue} surplus</span>;
    } else if (difference < 0) {
      return <span className="text-red-600">{formattedValue} deficit</span>;
    } else {
      return <span className="text-gray-600">Balanced</span>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Budget Name</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Expenses</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => (
            <TableRow key={budget.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{budget.name}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">{budget.description}</p>
                </div>
              </TableCell>
              <TableCell>{budget.year}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(budget.status)}>
                  {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(budget.totalRevenue)}</TableCell>
              <TableCell className="text-right">{formatCurrency(budget.totalExpenses)}</TableCell>
              <TableCell className="text-right">
                {calculateSurplusDeficit(budget.totalRevenue, budget.totalExpenses)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{budget.createdBy}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(budget.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onView(budget)}>
                  <Eye className="h-4 w-4" />
                </Button>
                {budget.status === 'draft' && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {budgets.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No budgets found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BudgetTable;
