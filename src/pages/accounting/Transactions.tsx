
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, Search, Filter, Download, Eye, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import TooltipButton from '@/components/ui/tooltip-button';

// Mock data for transactions
const mockTransactions = [
  {
    id: '1',
    date: '2025-04-05',
    description: 'Monthly Assessment Payment',
    property: 'Property #1234',
    amount: 250.00,
    type: 'income',
    category: 'Assessments',
    glAccount: '1001-00'
  },
  {
    id: '2',
    date: '2025-04-04',
    description: 'Pool Maintenance',
    property: 'Common Area',
    amount: 175.50,
    type: 'expense',
    category: 'Maintenance',
    glAccount: '5001-00'
  },
  {
    id: '3',
    date: '2025-04-03',
    description: 'Violation Fine Payment',
    property: 'Property #5678',
    amount: 100.00,
    type: 'income',
    category: 'Fines',
    glAccount: '3001-00'
  },
  {
    id: '4',
    date: '2025-04-02',
    description: 'Landscaping Services',
    property: 'Common Area',
    amount: 520.75,
    type: 'expense',
    category: 'Landscaping',
    glAccount: '5010-00'
  },
  {
    id: '5',
    date: '2025-04-01',
    description: 'Late Fee Payment',
    property: 'Property #9012',
    amount: 25.00,
    type: 'income',
    category: 'Late Fees',
    glAccount: '3002-00'
  },
  {
    id: '6',
    date: '2025-03-31',
    description: 'Insurance Premium',
    property: 'Association',
    amount: 1250.00,
    type: 'expense',
    category: 'Insurance',
    glAccount: '5050-00'
  },
  {
    id: '7',
    date: '2025-03-30',
    description: 'Special Assessment',
    property: 'Property #3456',
    amount: 500.00,
    type: 'income',
    category: 'Special Assessments',
    glAccount: '1002-00'
  }
];

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const filteredTransactions = mockTransactions
    .filter(transaction => 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(transaction => {
      if (selectedTab === 'all') return true;
      return transaction.type === selectedTab;
    });
  
  const incomeTransactions = mockTransactions.filter(t => t.type === 'income');
  const expenseTransactions = mockTransactions.filter(t => t.type === 'expense');
  
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2);
  const netCashFlow = (parseFloat(totalIncome) - parseFloat(totalExpense)).toFixed(2);
  
  return (
    <PageTemplate 
      title="Transactions" 
      icon={<Receipt className="h-8 w-8" />}
      description="Review and manage all financial transactions."
    >
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-green-800">Total Income</h3>
              <ArrowUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700">${totalIncome}</p>
            <p className="text-xs text-green-600 mt-1">From {incomeTransactions.length} transactions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-red-800">Total Expenses</h3>
              <ArrowDown className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-700">${totalExpense}</p>
            <p className="text-xs text-red-600 mt-1">From {expenseTransactions.length} transactions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-800">Net Cash Flow</h3>
              {parseFloat(netCashFlow) >= 0 ? 
                <ArrowUp className="h-4 w-4 text-blue-600" /> : 
                <ArrowDown className="h-4 w-4 text-red-600" />
              }
            </div>
            <p className="text-2xl font-bold text-blue-700">${netCashFlow}</p>
            <p className="text-xs text-blue-600 mt-1">From {mockTransactions.length} total transactions</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <Calendar className="h-4 w-4 mr-2" />
                    {date ? format(date, 'PP') : 'Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Select>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="assessments">Assessments</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="fines">Fines</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
              
              <TooltipButton
                variant="outline"
                size="icon"
                tooltip="Additional filters"
              >
                <Filter className="h-4 w-4" />
              </TooltipButton>
              
              <TooltipButton
                variant="outline"
                size="icon"
                tooltip="Export transactions"
              >
                <Download className="h-4 w-4" />
              </TooltipButton>
            </div>
          </div>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All Transactions
                <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {mockTransactions.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="income">
                Income
                <span className="ml-1.5 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                  {incomeTransactions.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="expense">
                Expenses
                <span className="ml-1.5 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">
                  {expenseTransactions.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <TransactionTable transactions={filteredTransactions} />
            </TabsContent>
            <TabsContent value="income">
              <TransactionTable 
                transactions={filteredTransactions.filter(t => t.type === 'income')}  
              />
            </TabsContent>
            <TabsContent value="expense">
              <TransactionTable 
                transactions={filteredTransactions.filter(t => t.type === 'expense')}  
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

interface TransactionTableProps {
  transactions: typeof mockTransactions;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>GL Account</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.property}</TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.category}</Badge>
                </TableCell>
                <TableCell>{transaction.glAccount}</TableCell>
                <TableCell className={`text-right font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <TooltipButton
                    size="icon"
                    variant="ghost"
                    tooltip="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </TooltipButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Transactions;
