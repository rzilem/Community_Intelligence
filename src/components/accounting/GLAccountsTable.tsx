import React, { useState } from 'react';
import { Search, PlusCircle, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GLAccount } from '@/types/accounting-types';
import GLAccountGroups from './GLAccountGroups';
import { GLAccountDialog } from './GLAccountDialog';
import GLAccountImportExport from './GLAccountImportExport';
import { useAuth } from '@/contexts/auth/useAuth';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface GLAccountsTableProps {
  accounts: GLAccount[];
  searchTerm: string;
  accountType: string;
  onSearchChange: (value: string) => void;
  onAccountTypeChange: (value: string) => void;
  onEdit?: (account: GLAccount) => void;
  onAccountAdded?: (account: GLAccount) => void;
}

const GLAccountsTable: React.FC<GLAccountsTableProps> = ({
  accounts,
  searchTerm,
  accountType,
  onSearchChange,
  onAccountTypeChange,
  onEdit,
  onAccountAdded
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentAssociation } = useAuth();
  const [balanceRange, setBalanceRange] = useState<[number, number]>([0, 20000]);
  const [sortField, setSortField] = useState<string>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const categories = Array.from(new Set(accounts.map(account => account.category))).filter(Boolean) as string[];

  const filteredAccounts = accounts.filter(account => {
    const matchesType = accountType === 'all' || account.type === accountType;
    const matchesCategory = categoryFilter === 'all' || account.category === categoryFilter;
    const matchesBalance = account.balance >= balanceRange[0] && account.balance <= balanceRange[1];
    const matchesActive =
      activeFilter === 'all' ||
      (activeFilter === 'active' && account.is_active) ||
      (activeFilter === 'inactive' && !account.is_active);
    return matchesType && matchesCategory && matchesBalance && matchesActive;
  });

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    let valueA, valueB;
    switch (sortField) {
      case 'code':
        valueA = a.code;
        valueB = b.code;
        break;
      case 'name':
        valueA = a.name;
        valueB = b.name;
        break;
      case 'balance':
        valueA = a.balance || 0;
        valueB = b.balance || 0;
        break;
      default:
        valueA = a.code;
        valueB = b.code;
    }
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    return 0;
  });

  const toggleSortDirection = () => {
    setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
  };

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      toggleSortDirection();
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const maxBalance = Math.max(...accounts.map(account => account.balance || 0));
  
  const handleActiveFilterChange = (value: string) => {
    setActiveFilter(value as 'all' | 'active' | 'inactive');
  };

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
          
          <Select value={activeFilter} onValueChange={handleActiveFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Active Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
          </Button>
          
          <GLAccountImportExport 
            accounts={accounts} 
            associationId={currentAssociation?.id}
            onImportComplete={() => onAccountAdded && onAccountAdded({} as GLAccount)}
          />
          
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Account
          </Button>
        </div>
      </div>

      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="categoryFilter">Filter by Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="categoryFilter" className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Balance Range: ${balanceRange[0]} - ${balanceRange[1]}</Label>
                <Slider
                  className="mt-2"
                  min={0}
                  max={maxBalance + 1000}
                  step={100}
                  value={balanceRange}
                  onValueChange={(value) => setBalanceRange(value as [number, number])}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label>Sort By</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge 
                    variant={sortField === 'code' ? 'default' : 'outline'} 
                    className="cursor-pointer"
                    onClick={() => handleSortChange('code')}
                  >
                    Code {sortField === 'code' && (
                      sortDirection === 'asc' ? <SortAsc className="inline h-3 w-3 ml-1" /> : <SortDesc className="inline h-3 w-3 ml-1" />
                    )}
                  </Badge>
                  <Badge 
                    variant={sortField === 'name' ? 'default' : 'outline'} 
                    className="cursor-pointer"
                    onClick={() => handleSortChange('name')}
                  >
                    Name {sortField === 'name' && (
                      sortDirection === 'asc' ? <SortAsc className="inline h-3 w-3 ml-1" /> : <SortDesc className="inline h-3 w-3 ml-1" />
                    )}
                  </Badge>
                  <Badge 
                    variant={sortField === 'balance' ? 'default' : 'outline'} 
                    className="cursor-pointer"
                    onClick={() => handleSortChange('balance')}
                  >
                    Balance {sortField === 'balance' && (
                      sortDirection === 'asc' ? <SortAsc className="inline h-3 w-3 ml-1" /> : <SortDesc className="inline h-3 w-3 ml-1" />
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <GLAccountGroups 
        accounts={sortedAccounts}
        searchTerm={searchTerm}
        onEdit={onEdit}
      />

      <GLAccountDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        associationId={currentAssociation?.id}
        onAccountAdded={onAccountAdded}
      />
    </>
  );
};

export default GLAccountsTable;
