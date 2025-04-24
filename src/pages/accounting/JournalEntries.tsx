import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { JournalEntry } from '@/components/banking/JournalEntryTable';
import JournalEntryDialog from '@/components/banking/journal-entry/JournalEntryDialog';
import JournalEntriesHeader from '@/components/banking/journal-entries/JournalEntriesHeader';
import JournalEntriesToolbar from '@/components/banking/journal-entries/JournalEntriesToolbar';
import JournalEntryTable from '@/components/banking/JournalEntryTable';
import { ensureGLAccountsHaveIsActive } from '@/utils/mock-data-helpers';

const mockGLAccounts = ensureGLAccountsHaveIsActive([
  { id: '1', code: '1000', name: 'Cash', type: 'Asset', description: 'Cash operating account', category: 'Cash & Equivalents', balance: 10000 },
  { id: '2', code: '1100', name: 'Accounts Receivable', type: 'Asset', description: 'Accounts receivable', category: 'Receivables', balance: 5000 },
  { id: '3', code: '2000', name: 'Accounts Payable', type: 'Liability', description: 'Accounts payable', category: 'Payables', balance: 3000 },
  { id: '4', code: '3000', name: 'Retained Earnings', type: 'Equity', description: 'Retained earnings', category: 'Equity', balance: 7000 },
  { id: '5', code: '4000', name: 'Revenue', type: 'Revenue', description: 'Revenue', category: 'Revenue', balance: 15000 },
  { id: '6', code: '5000', name: 'Expenses', type: 'Expense', description: 'General expenses', category: 'Expenses', balance: 8000 }
]);

const mockJournalEntriesData: JournalEntry[] = [
  {
    id: '1',
    date: '2025-03-15',
    reference: 'JE-2025-001',
    description: 'Monthly utility expense',
    amount: 1500,
    status: 'posted',
    createdBy: 'System Admin',
    createdAt: '2025-03-15T08:30:00Z'
  },
  {
    id: '2',
    date: '2025-03-16',
    reference: 'JE-2025-002',
    description: 'Assessment revenue recognition',
    amount: 12000,
    status: 'posted',
    createdBy: 'John Doe',
    createdAt: '2025-03-16T09:15:00Z'
  },
  {
    id: '3',
    date: '2025-03-20',
    reference: 'JE-2025-003',
    description: 'Office supplies expense',
    amount: 350,
    status: 'draft',
    createdBy: 'Jane Smith',
    createdAt: '2025-03-20T14:45:00Z'
  }
];

const JournalEntries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(mockJournalEntriesData);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | undefined>();
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = 
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAssociationChange = (associationId: string) => {
    console.log('Association changed to:', associationId);
    setSelectedAssociationId(associationId);
    // In a real implementation, we would fetch journal entries for this association
  };

  const handleCreateEntry = (data: any) => {
    console.log('Creating journal entry:', data);
    
    // Calculate the total amount as the sum of all debits (or credits)
    const amount = data.lineItems.reduce((sum: number, item: any) => sum + (Number(item.debit) || 0), 0);
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: data.date,
      reference: data.reference,
      description: data.description,
      amount,
      status: 'draft',
      createdBy: 'Current User', // Would come from authentication context in a real app
      createdAt: new Date().toISOString()
    };
    
    setJournalEntries([newEntry, ...journalEntries]);
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
    
    const amount = data.lineItems.reduce((sum: number, item: any) => sum + (Number(item.debit) || 0), 0);
    
    const updatedEntry = {
      ...selectedEntry,
      date: data.date,
      reference: data.reference,
      description: data.description,
      amount
    };
    
    setJournalEntries(journalEntries.map(entry => 
      entry.id === selectedEntry.id ? updatedEntry : entry
    ));
    
    setSelectedEntry(undefined);
    setIsDialogOpen(false);
  };

  return (
    <PageTemplate 
      title="Journal Entries" 
      icon={<BookOpen className="h-8 w-8" />}
      description="Create and manage accounting journal entries for financial adjustments."
    >
      <Card>
        <CardHeader>
          <JournalEntriesHeader onAssociationChange={handleAssociationChange} />
        </CardHeader>
        <CardContent>
          <JournalEntriesToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onCreateClick={() => {
              setSelectedEntry(undefined);
              setIsDialogOpen(true);
            }}
          />

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
    </PageTemplate>
  );
};

export default JournalEntries;
