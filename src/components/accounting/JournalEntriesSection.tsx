
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { JournalEntry, GLAccount } from '@/types/accounting-types';
import JournalEntryTable from '@/components/banking/JournalEntryTable';
import JournalEntryDialog from '@/components/banking/JournalEntryDialog';
import { ensureGLAccountsHaveIsActive } from '@/utils/mock-data-helpers';

// Updated mock GL accounts to include is_active property
const mockGLAccounts = ensureGLAccountsHaveIsActive([
  { id: '1', number: '1000', code: '1000', name: 'Cash', type: 'Asset', description: 'Cash operating account', category: 'Cash & Equivalents', balance: 10000 },
  { id: '2', number: '1100', code: '1100', name: 'Accounts Receivable', type: 'Asset', description: 'Accounts receivable', category: 'Receivables', balance: 5000 },
  { id: '3', number: '2000', code: '2000', name: 'Accounts Payable', type: 'Liability', description: 'Accounts payable', category: 'Payables', balance: 3000 },
  { id: '4', number: '3000', code: '3000', name: 'Retained Earnings', type: 'Equity', description: 'Retained earnings', category: 'Equity', balance: 7000 },
  { id: '5', number: '4000', code: '4000', name: 'Revenue', type: 'Revenue', description: 'Revenue', category: 'Revenue', balance: 15000 },
  { id: '6', number: '5000', code: '5000', name: 'Expenses', type: 'Expense', description: 'General expenses', category: 'Expenses', balance: 8000 },
]);

interface JournalEntriesSectionProps {
  journalEntries: JournalEntry[];
  associationId?: string;
}

const JournalEntriesSection: React.FC<JournalEntriesSectionProps> = ({ 
  journalEntries, 
  associationId 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | undefined>();
  
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = 
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateEntry = (data: any) => {
    console.log('Creating journal entry:', data);
    
    // In a real implementation, this would update the journal entries in the database
    // and then refresh the data. For now, we'll just console.log the data.
    
    setIsDialogOpen(false);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

  const handleViewEntry = (entry: JournalEntry) => {
    console.log('Viewing entry:', entry);
    // In a real implementation, we would show a detailed view dialog
  };

  const handleUpdateEntry = (data: any) => {
    if (!selectedEntry) return;
    
    console.log('Updating journal entry:', data);
    
    // In a real implementation, this would update the journal entry in the database
    // and then refresh the data. For now, we'll just console.log the data.
    
    setSelectedEntry(undefined);
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="reconciled">Reconciled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" /> More Filters
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>

            <Button onClick={() => {
              setSelectedEntry(undefined);
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" /> Create Entry
            </Button>
          </div>
        </div>

        <JournalEntryTable 
          entries={filteredEntries}
          onEdit={handleEditEntry}
          onView={handleViewEntry}
        />

        <JournalEntryDialog 
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedEntry(undefined);
          }}
          onSubmit={selectedEntry ? handleUpdateEntry : handleCreateEntry}
          entry={selectedEntry}
          accounts={mockGLAccounts}
        />
      </CardContent>
    </Card>
  );
};

export default JournalEntriesSection;
