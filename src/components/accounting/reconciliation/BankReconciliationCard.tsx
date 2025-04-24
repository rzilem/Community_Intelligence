
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BankAccount } from '@/types/bank-statement-types';

interface BankReconciliationCardProps {
  bankAccount: BankAccount;
  onReconcile: () => void;
}

export const BankReconciliationCard: React.FC<BankReconciliationCardProps> = ({
  bankAccount,
  onReconcile,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          {bankAccount.name}
        </CardTitle>
        <Badge variant={bankAccount.last_reconciled_date ? "secondary" : "destructive"}>
          {bankAccount.last_reconciled_date ? "Reconciled" : "Needs Reconciliation"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Last Statement Date:</span>
            <span className="font-medium">
              {bankAccount.last_statement_date || 'No statements'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Last Reconciled:</span>
            <span className="font-medium">
              {bankAccount.last_reconciled_date || 'Never'}
            </span>
          </div>
          <Button 
            className="w-full mt-4" 
            onClick={onReconcile}
            variant="outline"
          >
            Start Reconciliation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
