import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BookOpen, Plus, Search, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AssociationSelector from '@/components/associations/AssociationSelector';
import JournalEntryTable, { JournalEntry } from '@/components/banking/JournalEntryTable';
import JournalEntryDialog from '@/components/banking/JournalEntryDialog';

// Updated mock GL accounts to match the GLAccount interface
const mockGLAccounts = [
  { id: '1', number: '1000', code: '1000', name: 'Cash', type: 'Asset', description: 'Cash operating account', category: 'Cash & Equivalents', balance: 10000 },
  { id: '2', number: '1100', code: '1100', name: 'Accounts Receivable', type: 'Asset', description: 'Accounts receivable', category: 'Receivables', balance: 5000 },
  { id: '3', number: '2000', code: '2000', name: 'Accounts Payable', type: 'Liability', description: 'Accounts payable', category: 'Payables', balance: 3000 },
  { id: '4', number: '3000', code: '3000', name: 'Retained Earnings', type: 'Equity', description: 'Retained earnings', category: 'Equity', balance: 7000 },
  { id: '5', number: '4000', code: '4000', name: 'Revenue', type: 'Revenue', description: 'Revenue', category: 'Revenue', balance: 15000 },
  { id: '6', number: '5000', code: '5000', name: 'Expenses', type: 'Expense', description: 'General expenses', category: 'Expenses', balance: 8000 },
];

// Mock journal entries
const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    date: '2025-04-01',
    reference: 'JE-2025-001',
    description: 'Monthly rent revenue recognition',
    amount: 5000,
    status: 'posted',
    createdBy: 'John Smith',
    createdAt: '2025-04-01T10:30:00Z'
  },
  {
    id: '2',
    date: '2025-04-02',
    reference: 'JE-2025-002',
    description: 'Office supplies expense',
    amount: 350.75,
    status: 'posted',
    createdBy: 'John Smith',
    createdAt: '2025-04-02T11:15:00Z'
  },
  {
    id: '3',
    date: '2025-04-05',
    reference: 'JE-2025-003',
    description: 'Maintenance service payment',
    amount: 1200,
    status: 'reconciled',
    createdBy: 'Jane Doe',
    createdAt: '2025-04-05T14:45:00Z'
  },
  {
    id: '4',
    date: '2025-04-08',
    reference: 'JE-2025-004',
    description: 'Adjustment for overpayment of assessment fees',
    amount: 475.25,
    status: 'draft',
    createdBy: 'Jane Doe',
    createdAt: '2025-04-08T09:20:00Z'
  },
  {
    id: '5',
    date: '2025-04-09',
    reference: 'JE-2025-005',
    description: 'Transfer to reserve account',
    amount: 2500,
    status: 'posted',
    createdBy: 'John Smith',
    createdAt: '2025-04-09T15:10:00Z'
  }
];

const JournalEntries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(mockJournalEntries);
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Journal Entries</CardTitle>
              <CardDescription>Create and manage journal entries for accounting adjustments</CardDescription>
            </div>
            <AssociationSelector 
              className="md:self-end" 
              onAssociationChange={handleAssociationChange} 
            />
          </div>
        </CardHeader>
        <CardContent>
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
    </PageTemplate>
  );
};

export default JournalEntries;
