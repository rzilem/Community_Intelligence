import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calculator, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdvancedGLService, type JournalEntryData } from '@/services/accounting/advanced-gl-service';

interface JournalEntryLine {
  id: string;
  gl_account_id: string;
  gl_account_code?: string;
  gl_account_name?: string;
  debit_amount?: number;
  credit_amount?: number;
  description?: string;
  property_id?: string;
}

interface JournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associationId: string;
  entryId?: string;
  onSave: () => void;
}

const JournalEntryDialog: React.FC<JournalEntryDialogProps> = ({
  open,
  onOpenChange,
  associationId,
  entryId,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    entry_number: '',
    reference_number: '',
    description: '',
    entry_date: new Date().toISOString().split('T')[0],
  });

  const [lineItems, setLineItems] = useState<JournalEntryLine[]>([
    { id: '1', gl_account_id: '', debit_amount: 0, credit_amount: 0, description: '' },
    { id: '2', gl_account_id: '', debit_amount: 0, credit_amount: 0, description: '' },
  ]);

  useEffect(() => {
    if (open) {
      fetchAccounts();
    }
  }, [open, associationId]);

  const fetchAccounts = async () => {
    try {
      const accountData = await AdvancedGLService.getChartOfAccounts(associationId);
      setAccounts(accountData);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems([
      ...lineItems,
      { id: newId, gl_account_id: '', debit_amount: 0, credit_amount: 0, description: '' }
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 2) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Auto-clear opposite amount when entering debit/credit
        if (field === 'debit_amount' && value > 0) {
          updated.credit_amount = 0;
        } else if (field === 'credit_amount' && value > 0) {
          updated.debit_amount = 0;
        }

        // Set account details when account is selected
        if (field === 'gl_account_id') {
          const account = accounts.find(acc => acc.id === value);
          if (account) {
            updated.gl_account_code = account.code;
            updated.gl_account_name = account.name;
          }
        }

        return updated;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const totalDebits = lineItems.reduce((sum, item) => sum + (item.debit_amount || 0), 0);
    const totalCredits = lineItems.reduce((sum, item) => sum + (item.credit_amount || 0), 0);
    const difference = totalDebits - totalCredits;
    return { totalDebits, totalCredits, difference, isBalanced: Math.abs(difference) < 0.01 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totals = calculateTotals();
    
    if (!totals.isBalanced) {
      toast({
        title: "Entry Not Balanced",
        description: "Debits must equal credits before posting.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const journalEntryData: JournalEntryData = {
        association_id: associationId,
        entry_number: formData.entry_number,
        reference_number: formData.reference_number,
        description: formData.description,
        entry_date: formData.entry_date,
        line_items: lineItems.map(item => ({
          gl_account_id: item.gl_account_id,
          debit_amount: item.debit_amount || 0,
          credit_amount: item.credit_amount || 0,
          description: item.description || formData.description,
          property_id: item.property_id
        }))
      };

      await AdvancedGLService.postJournalEntry(journalEntryData);
      
      toast({
        title: "Journal Entry Posted",
        description: "The journal entry has been successfully posted to the general ledger."
      });
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post journal entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entryId ? 'Edit Journal Entry' : 'New Journal Entry'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entry Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="entry_date">Entry Date</Label>
                  <Input
                    id="entry_date"
                    type="date"
                    value={formData.entry_date}
                    onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="entry_number">Entry Number</Label>
                  <Input
                    id="entry_number"
                    value={formData.entry_number}
                    onChange={(e) => setFormData({...formData, entry_number: e.target.value})}
                    placeholder="Auto-generated if blank"
                  />
                </div>
                <div>
                  <Label htmlFor="reference_number">Reference Number</Label>
                  <Input
                    id="reference_number"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                    placeholder="Optional reference"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe this journal entry..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Journal Entry Lines</CardTitle>
              <Button type="button" onClick={addLineItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-3">
                      <Label>Account</Label>
                      <Select
                        value={item.gl_account_id}
                        onValueChange={(value) => updateLineItem(item.id, 'gl_account_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label>Debit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.debit_amount || ''}
                        onChange={(e) => updateLineItem(item.id, 'debit_amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Credit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.credit_amount || ''}
                        onChange={(e) => updateLineItem(item.id, 'credit_amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-4">
                      <Label>Line Description</Label>
                      <Input
                        value={item.description || ''}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Line description (optional)"
                      />
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length <= 2}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals and Balance Check */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Total Debits</div>
                    <div className="text-lg font-mono font-bold">
                      ${totals.totalDebits.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Total Credits</div>
                    <div className="text-lg font-mono font-bold">
                      ${totals.totalCredits.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Difference</div>
                    <div className={`text-lg font-mono font-bold ${totals.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(totals.difference).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {totals.isBalanced ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Calculator className="h-4 w-4 mr-1" />
                      Balanced
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Out of Balance
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !totals.isBalanced}>
              {loading ? 'Posting...' : 'Post Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;