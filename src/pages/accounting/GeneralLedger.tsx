import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Book, Filter, Download, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TooltipButton from '@/components/ui/tooltip-button';

// Mock data for general ledger entries
const mockEntries = [
  {
    id: '1',
    date: '2025-01-28',
    account: '1100 - Cash',
    description: 'Monthly Assessment Payment - Unit 204',
    reference: 'PAY-001',
    debit: 350,
    credit: 0,
    balance: 45350
  },
  {
    id: '2',
    date: '2025-01-28',
    account: '4100 - Assessment Income',
    description: 'Monthly Assessment Payment - Unit 204',
    reference: 'PAY-001',
    debit: 0,
    credit: 350,
    balance: 24850
  },
  {
    id: '3',
    date: '2025-01-27',
    account: '6200 - Landscaping Expense',
    description: 'Monthly landscaping services',
    reference: 'INV-LS-001',
    debit: 1250,
    credit: 0,
    balance: 8750
  },
  {
    id: '4',
    date: '2025-01-27',
    account: '2100 - Accounts Payable',
    description: 'Monthly landscaping services',
    reference: 'INV-LS-001',
    debit: 0,
    credit: 1250,
    balance: 3250
  },
  {
    id: '5',
    date: '2025-01-26',
    account: '1100 - Cash',
    description: 'Bank fee for January',
    reference: 'BNK-FEE-001',
    debit: 0,
    credit: 25,
    balance: 45000
  },
  {
    id: '6',
    date: '2025-01-26',
    account: '6100 - Bank Fees',
    description: 'Bank fee for January',
    reference: 'BNK-FEE-001',
    debit: 25,
    credit: 0,
    balance: 125
  }
];

const GeneralLedger = () => {
  const [entries] = useState(mockEntries);
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = entries.filter(entry => {
    const matchesAccount = accountFilter === 'all' || entry.account.includes(accountFilter);
    const matchesSearch = searchTerm === '' || 
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAccount && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique accounts for filter
  const uniqueAccounts = [...new Set(entries.map(entry => entry.account.split(' - ')[0]))];

  // Calculate totals
  const totalDebits = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = entries.reduce((sum, entry) => sum + entry.credit, 0);

  return (
    <AppLayout>
      <PageTemplate
        title="General Ledger"
        icon={<Book className="h-8 w-8" />}
        description="View all journal entries and account transactions in chronological order."
        actions={
          <TooltipButton
            tooltip="Export general ledger report"
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </TooltipButton>
        }
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{entries.length}</div>
                <p className="text-xs text-muted-foreground">This period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Debits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalDebits)}</div>
                <p className="text-xs text-muted-foreground">All accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCredits)}</div>
                <p className="text-xs text-muted-foreground">All accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Balance Check</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalDebits === totalCredits ? 'text-green-600' : 'text-red-600'}`}>
                  {totalDebits === totalCredits ? '✓ Balanced' : '✗ Unbalanced'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Difference: {formatCurrency(Math.abs(totalDebits - totalCredits))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>General Ledger Entries</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={accountFilter} onValueChange={setAccountFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts</SelectItem>
                      {uniqueAccounts.map(account => (
                        <SelectItem key={account} value={account}>{account}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{entry.account}</div>
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                      <TableCell className="text-right">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(entry.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default GeneralLedger;