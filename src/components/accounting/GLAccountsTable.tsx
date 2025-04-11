
import React from 'react';
import { Search, ArrowUpDown, Download, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ColumnSelector from '@/components/table/ColumnSelector';
import { GLAccount } from '@/types/accounting-types';

type ColumnKey = 'code' | 'description' | 'type' | 'category';

interface GLAccountsTableProps {
  accounts: GLAccount[];
  searchTerm: string;
  accountType: string;
  visibleColumns: ColumnKey[];
  onSearchChange: (value: string) => void;
  onAccountTypeChange: (value: string) => void;
  onColumnChange: (columns: string[]) => void;
}

const GLAccountsTable: React.FC<GLAccountsTableProps> = ({
  accounts,
  searchTerm,
  accountType,
  visibleColumns,
  onSearchChange,
  onAccountTypeChange,
  onColumnChange
}) => {
  const columnOptions = [
    { id: 'code', label: 'Code' },
    { id: 'description', label: 'Description' },
    { id: 'type', label: 'GL Type' },
    { id: 'category', label: 'Category' }
  ];

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = accountType === 'all' || account.type === accountType;
    
    return matchesSearch && matchesType;
  });

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Select value={accountType} onValueChange={onAccountTypeChange}>
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
            onChange={onColumnChange} 
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
    </>
  );
};

export default GLAccountsTable;
