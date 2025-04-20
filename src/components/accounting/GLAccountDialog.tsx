
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GLAccount } from '@/types/accounting-types';

interface GLAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  associationId?: string | null;
  onAccountAdded?: (account: GLAccount) => void;
  accountToEdit?: GLAccount;
}

export const GLAccountDialog: React.FC<GLAccountDialogProps> = ({
  isOpen,
  onOpenChange,
  associationId,
  onAccountAdded,
  accountToEdit
}) => {
  const [formData, setFormData] = useState({
    code: accountToEdit?.code || '',
    name: accountToEdit?.name || '',
    type: accountToEdit?.type || 'Expense',
    description: accountToEdit?.description || '',
    category: accountToEdit?.category || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, type: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const accountData = {
        code: formData.code,
        name: formData.name,
        type: formData.type,
        description: formData.description || formData.name,
        category: formData.category || null,
        association_id: associationId
      };

      let operation;
      
      if (accountToEdit) {
        // Update existing account
        operation = supabase
          .from('gl_accounts')
          .update(accountData)
          .eq('id', accountToEdit.id)
          .select();
      } else {
        // Create new account
        operation = supabase
          .from('gl_accounts')
          .insert(accountData)
          .select();
      }

      const { data, error } = await operation;

      if (error) {
        throw error;
      }

      toast.success(accountToEdit ? 'GL account updated successfully' : 'GL account created successfully');
      onOpenChange(false);
      
      if (data && data.length > 0 && onAccountAdded) {
        onAccountAdded(data[0] as GLAccount);
      }
    } catch (error: any) {
      console.error('Error saving GL account:', error);
      toast.error(error.message || 'Failed to save GL account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = accountToEdit ? 'Edit GL Account' : associationId ? 'Add Association GL Account' : 'Add Master GL Account';
  const buttonText = accountToEdit ? 'Update Account' : 'Create Account';
  
  const getAccountTypeLabel = () => {
    return associationId ? 'Association GL Account' : 'Master GL Account';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {associationId 
              ? 'Create or update a GL account specific to this association.' 
              : 'Create or update a master GL account that can be shared across associations.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Account Code</Label>
              <Input
                id="code"
                name="code"
                placeholder="e.g., 1000"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Account Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asset">Asset</SelectItem>
                  <SelectItem value="Liability">Liability</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Cash Operating Account"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter a detailed description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              name="category"
              placeholder="e.g., Operating, Reserve"
              value={formData.category}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="pt-4 flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : buttonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
