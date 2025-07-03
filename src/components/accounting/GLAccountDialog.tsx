import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface GLAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: any;
  associationId: string;
  onSave: () => void;
}

const GLAccountDialog: React.FC<GLAccountDialogProps> = ({
  open,
  onOpenChange,
  account,
  associationId,
  onSave
}) => {
  const [formData, setFormData] = useState({
    account_code: account?.account_code || '',
    account_name: account?.account_name || '',
    account_type: account?.account_type || '',
    account_subtype: account?.account_subtype || '',
    parent_account_id: account?.parent_account_id || '',
    description: account?.description || '',
    is_active: account?.is_active ?? true,
    budget_account: account?.budget_account ?? true,
    normal_balance: account?.normal_balance || 'debit'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to save/update account
    console.log('Saving account:', formData);
    onOpenChange(false);
  };

  const subtypeOptions = {
    asset: [
      { value: 'current_asset', label: 'Current Asset' },
      { value: 'fixed_asset', label: 'Fixed Asset' },
      { value: 'other_asset', label: 'Other Asset' }
    ],
    liability: [
      { value: 'current_liability', label: 'Current Liability' },
      { value: 'long_term_liability', label: 'Long-term Liability' },
      { value: 'other_liability', label: 'Other Liability' }
    ],
    equity: [
      { value: 'member_equity', label: 'Member Equity' },
      { value: 'retained_earnings', label: 'Retained Earnings' }
    ],
    revenue: [
      { value: 'assessment_income', label: 'Assessment Income' },
      { value: 'other_income', label: 'Other Income' },
      { value: 'interest_income', label: 'Interest Income' }
    ],
    expense: [
      { value: 'operating_expense', label: 'Operating Expense' },
      { value: 'maintenance_expense', label: 'Maintenance Expense' },
      { value: 'administrative_expense', label: 'Administrative Expense' },
      { value: 'reserve_expense', label: 'Reserve Expense' }
    ]
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Edit Account' : 'Add New Account'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account_code">Account Code</Label>
              <Input
                id="account_code"
                value={formData.account_code}
                onChange={(e) => setFormData({...formData, account_code: e.target.value})}
                placeholder="1000"
                required
              />
            </div>
            <div>
              <Label htmlFor="normal_balance">Normal Balance</Label>
              <Select value={formData.normal_balance} onValueChange={(value) => setFormData({...formData, normal_balance: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="account_name">Account Name</Label>
            <Input
              id="account_name"
              value={formData.account_name}
              onChange={(e) => setFormData({...formData, account_name: e.target.value})}
              placeholder="Cash - Operating"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account_type">Account Type</Label>
              <Select value={formData.account_type} onValueChange={(value) => setFormData({...formData, account_type: value, account_subtype: ''})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="account_subtype">Subtype</Label>
              <Select value={formData.account_subtype} onValueChange={(value) => setFormData({...formData, account_subtype: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subtype" />
                </SelectTrigger>
                <SelectContent>
                  {formData.account_type && subtypeOptions[formData.account_type as keyof typeof subtypeOptions]?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Account description..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="budget_account"
                checked={formData.budget_account}
                onCheckedChange={(checked) => setFormData({...formData, budget_account: checked})}
              />
              <Label htmlFor="budget_account">Budget Account</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {account ? 'Update' : 'Create'} Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GLAccountDialog;