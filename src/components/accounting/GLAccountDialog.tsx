import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GLAccount } from '@/types/accounting-types';
import { useGLAccounts, getFormattedAccountCategories } from '@/hooks/accounting/useGLAccounts';

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
  const [codeError, setCodeError] = useState('');
  const [existingCodes, setExistingCodes] = useState<string[]>([]);

  // Fetch existing codes for validation
  useEffect(() => {
    const fetchExistingCodes = async () => {
      try {
        let query = supabase.from('gl_accounts').select('code');
        if (associationId) {
          query = query.eq('association_id', associationId);
        } else {
          query = query.is('association_id', null);
        }
        
        if (accountToEdit) {
          query = query.neq('id', accountToEdit.id);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        setExistingCodes(data.map(item => item.code));
      } catch (error) {
        console.error('Error fetching existing codes:', error);
      }
    };
    
    if (isOpen) {
      fetchExistingCodes();
    }
  }, [isOpen, associationId, accountToEdit]);

  // For available categories
  const { accounts } = useGLAccounts({
    associationId: associationId || undefined,
    includeMaster: true
  });
  
  const categories = getFormattedAccountCategories(accounts);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'code') {
      // Validate code format and uniqueness
      const codeRegex = /^\d+$/;
      if (!codeRegex.test(value)) {
        setCodeError('Code must contain only numbers');
      } else if (existingCodes.includes(value)) {
        setCodeError('This code is already in use');
      } else {
        setCodeError('');
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (codeError) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const accountData = {
        code: formData.code,
        name: formData.name,
        type: formData.type as GLAccount['type'], // Ensure type safety
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
              <div className="flex items-center justify-between">
                <Label htmlFor="code">Account Code</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Account Code Guidelines</h4>
                      <p className="text-sm text-muted-foreground">
                        Account codes typically follow a standardized structure:
                      </p>
                      <ul className="text-sm list-disc pl-4 space-y-1">
                        <li>1000-1999: Assets</li>
                        <li>2000-2999: Liabilities</li>
                        <li>3000-3999: Equity</li>
                        <li>4000-4999: Revenue</li>
                        <li>5000-9999: Expenses</li>
                      </ul>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                id="code"
                name="code"
                placeholder="e.g., 1000"
                value={formData.code}
                onChange={handleInputChange}
                required
                className={codeError ? "border-red-500" : ""}
              />
              {codeError && <p className="text-sm text-red-500">{codeError}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Account Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
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
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category || ""}
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Category</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                <SelectItem value="__new__" className="text-primary font-medium">
                  + Add New Category
                </SelectItem>
              </SelectContent>
            </Select>
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
              disabled={isSubmitting || !!codeError}
            >
              {isSubmitting ? 'Saving...' : buttonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
