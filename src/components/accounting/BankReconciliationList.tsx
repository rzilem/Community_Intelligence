import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BankReconciliation {
  id: string;
  reconciliation_date: string;
  statement_date: string;
  statement_balance: number;
  reconciled_balance: number;
  difference: number;
  status: 'in_progress' | 'completed' | 'approved';
}

interface BankReconciliationListProps {
  selectedAccount: string;
  onEditReconciliation: (reconciliation: BankReconciliation) => void;
}

const BankReconciliationList: React.FC<BankReconciliationListProps> = ({
  selectedAccount,
  onEditReconciliation
}) => {
  // Mock data - in real app this would come from API
  const reconciliations: BankReconciliation[] = [
    {
      id: '1',
      reconciliation_date: '2024-12-31',
      statement_date: '2024-12-31',
      statement_balance: 125430.25,
      reconciled_balance: 125430.25,
      difference: 0,
      status: 'approved'
    },
    {
      id: '2',
      reconciliation_date: '2024-11-30',
      statement_date: '2024-11-30',
      statement_balance: 118562.10,
      reconciled_balance: 118562.10,
      difference: 0,
      status: 'completed'
    },
    {
      id: '3',
      reconciliation_date: '2024-10-31',
      statement_date: '2024-10-31',
      statement_balance: 112450.50,
      reconciled_balance: 112189.75,
      difference: 260.75,
      status: 'in_progress'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  if (!selectedAccount) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Please select a bank account to view reconciliation history.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reconciliation Date</TableHead>
            <TableHead>Statement Date</TableHead>
            <TableHead className="text-right">Statement Balance</TableHead>
            <TableHead className="text-right">Reconciled Balance</TableHead>
            <TableHead className="text-right">Difference</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reconciliations.map((reconciliation) => (
            <TableRow key={reconciliation.id}>
              <TableCell>{formatDate(reconciliation.reconciliation_date)}</TableCell>
              <TableCell>{formatDate(reconciliation.statement_date)}</TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(reconciliation.statement_balance)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(reconciliation.reconciled_balance)}
              </TableCell>
              <TableCell className="text-right font-mono">
                <span className={reconciliation.difference !== 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(reconciliation.difference)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(reconciliation.status)}
                  <Badge className={getStatusVariant(reconciliation.status)}>
                    {reconciliation.status.replace('_', ' ')}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {reconciliation.status === 'in_progress' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditReconciliation(reconciliation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {reconciliations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No reconciliations found for this account.
        </div>
      )}
    </div>
  );
};

export default BankReconciliationList;