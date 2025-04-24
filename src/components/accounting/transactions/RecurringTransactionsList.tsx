
import React from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { DataTable } from '@/components/ui/data-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { RecurringTransaction } from '@/types/recurring-transaction-types';

export const RecurringTransactionsList = () => {
  const { data: recurringTransactions = [], isLoading } = useSupabaseQuery<RecurringTransaction[]>(
    'recurring_transactions',
    {
      select: '*',
      order: { column: 'created_at', ascending: false }
    }
  );

  const columns = [
    {
      accessorKey: 'description',
      header: 'Description'
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span>${row.original.amount.toFixed(2)}</span>
      )
    },
    {
      accessorKey: 'frequency',
      header: 'Frequency',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.frequency}
        </Badge>
      )
    },
    {
      accessorKey: 'next_generation_date',
      header: 'Next Generation',
      cell: ({ row }) => (
        row.original.next_generation_date ? 
        format(new Date(row.original.next_generation_date), 'MMM d, yyyy') :
        'N/A'
      )
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={recurringTransactions} 
      isLoading={isLoading}
    />
  );
};
