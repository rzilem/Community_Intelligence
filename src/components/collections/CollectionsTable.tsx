
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CollectionAccount } from '@/hooks/collections/useCollectionsData';

interface CollectionsTableProps {
  accounts: CollectionAccount[];
  onSelectAccount: (id: string) => void;
}

export function CollectionsTable({ accounts, onSelectAccount }: CollectionsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Delinquent Since</TableHead>
            <TableHead>Last Payment</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No delinquent accounts found
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => (
              <TableRow 
                key={account.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectAccount(account.id)}
              >
                <TableCell>
                  {account.property?.address}
                  {account.property?.unit_number && ` Unit ${account.property.unit_number}`}
                </TableCell>
                <TableCell>{account.resident?.name || 'Unknown'}</TableCell>
                <TableCell className="font-medium text-red-600">
                  {formatCurrency(account.balance_amount)}
                </TableCell>
                <TableCell>{formatDate(account.delinquent_since)}</TableCell>
                <TableCell>
                  {account.last_payment_date ? (
                    <div>
                      {formatDate(account.last_payment_date)}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(account.last_payment_amount || 0)}
                      </span>
                    </div>
                  ) : (
                    'No payments'
                  )}
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                    {account.status}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
