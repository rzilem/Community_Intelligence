
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database, Search, ArrowUpDown, Download, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AssociationSelector from '@/components/associations/AssociationSelector';
import ColumnSelector from '@/components/table/ColumnSelector';

type GLAccount = {
  code: string;
  description: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  category: string;
};

const mockGLAccounts: GLAccount[] = [
  { code: '1000', description: 'First Citizens Bank Operating-X2806', type: 'Asset', category: 'Assets' },
  { code: '1015', description: 'First Citizens Bank Capital Improvement-X96', type: 'Asset', category: 'Assets' },
  { code: '1100', description: 'First Citizens Bank Reserve-X7393', type: 'Asset', category: 'Assets' },
  { code: '1102', description: 'CD-X1349', type: 'Asset', category: 'Assets' },
  { code: '1200', description: 'Accounts Receivable', type: 'Asset', category: 'Assets' },
  { code: '1205', description: 'Allowance for Bad Debt', type: 'Asset', category: 'Assets' },
  { code: '1300', description: 'Prepaid Expenses', type: 'Asset', category: 'Assets' },
  { code: '2000', description: 'Accounts Payable', type: 'Liability', category: 'Liabilities' },
  { code: '2100', description: 'Accrued Expenses', type: 'Liability', category: 'Liabilities' },
  { code: '3000', description: 'Operating Fund Balance', type: 'Equity', category: 'Equity' },
  { code: '3100', description: 'Reserve Fund Balance', type: 'Equity', category: 'Equity' },
  { code: '4000', description: 'Assessment Income', type: 'Revenue', category: 'Income' },
  { code: '4100', description: 'Late Fee Income', type: 'Revenue', category: 'Income' },
  { code: '5000', description: 'Landscaping', type: 'Expense', category: 'Expenses' },
  { code: '5100', description: 'Repairs & Maintenance', type: 'Expense', category: 'Expenses' },
];

type ColumnKey = 'code' | 'description' | 'type' | 'category';

const GLAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountType, setAccountType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('master');
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(['code', 'description', 'type', 'category']);

  const filteredAccounts = mockGLAccounts.filter(account => {
    const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = accountType === 'all' || account.type === accountType;
    
    return matchesSearch && matchesType;
  });

  const columnOptions = [
    { id: 'code', label: 'Code' },
    { id: 'description', label: 'Description' },
    { id: 'type', label: 'GL Type' },
    { id: 'category', label: 'Category' }
  ];

  const handleColumnChange = (selectedColumns: string[]) => {
    setVisibleColumns(selectedColumns as ColumnKey[]);
  };

  return (
    <PageTemplate 
      title="GL Accounts" 
      icon={<Database className="h-8 w-8" />}
      description="Manage general ledger accounts and chart of accounts."
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>Manage general ledger accounts for your associations</CardDescription>
            </div>
            <AssociationSelector className="md:self-end" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="master" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="master">
                <Database className="h-4 w-4 mr-2" />
                Master GL List
              </TabsTrigger>
              <TabsTrigger value="association">
                <Database className="h-4 w-4 mr-2" />
                Association GL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="master">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search accounts..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <Select value={accountType} onValueChange={setAccountType}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Asset">Asset</SelectItem>
                      <SelectItem value="Liability">Liability</SelectItem>
                      <SelectItem value="Equity">Equity</SelectItem>
                      <SelectItem value="Revenue">Revenue</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <ColumnSelector 
                    columns={columnOptions} 
                    selectedColumns={visibleColumns} 
                    onChange={handleColumnChange} 
                  />
                  
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                  
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Account
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.includes('code') && (
                        <TableHead className="w-[100px]">
                          <div className="flex items-center">
                            Code
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </div>
                        </TableHead>
                      )}
                      {visibleColumns.includes('description') && (
                        <TableHead>
                          <div className="flex items-center">
                            Description
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </div>
                        </TableHead>
                      )}
                      {visibleColumns.includes('type') && (
                        <TableHead>
                          <div className="flex items-center">
                            GL Type
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </div>
                        </TableHead>
                      )}
                      {visibleColumns.includes('category') && (
                        <TableHead>
                          <div className="flex items-center">
                            Category
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </div>
                        </TableHead>
                      )}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={visibleColumns.length + 1} className="text-center py-6 text-muted-foreground">
                          No accounts found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAccounts.map((account) => (
                        <TableRow key={account.code}>
                          {visibleColumns.includes('code') && (
                            <TableCell className="font-medium">{account.code}</TableCell>
                          )}
                          {visibleColumns.includes('description') && (
                            <TableCell>{account.description}</TableCell>
                          )}
                          {visibleColumns.includes('type') && (
                            <TableCell>{account.type}</TableCell>
                          )}
                          {visibleColumns.includes('category') && (
                            <TableCell>{account.category}</TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="association">
              <div className="p-4 text-center text-muted-foreground">
                Association-specific GL accounts will appear here.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default GLAccounts;
