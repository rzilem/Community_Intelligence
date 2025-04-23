import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GLAccount } from '@/types/accounting-types';

// Mock GL accounts data for development
const mockGLAccounts: GLAccount[] = [
  { id: '1', code: '1000', name: 'Cash', type: 'Asset', description: 'Cash operating account', category: 'Cash & Equivalents', balance: 10000, is_active: true },
  { id: '2', code: '1100', name: 'Accounts Receivable', type: 'Asset', description: 'Accounts receivable', category: 'Receivables', balance: 5000, is_active: true },
  { id: '3', code: '2000', name: 'Accounts Payable', type: 'Liability', description: 'Accounts payable', category: 'Payables', balance: 3000, is_active: true },
  { id: '4', code: '3000', name: 'Retained Earnings', type: 'Equity', description: 'Retained earnings', category: 'Equity', balance: 7000, is_active: true },
  { id: '5', code: '4000', name: 'Revenue', type: 'Revenue', description: 'Revenue', category: 'Revenue', balance: 15000, is_active: true },
  { id: '6', code: '5000', name: 'Expenses', type: 'Expense', description: 'General expenses', category: 'Expenses', balance: 8000, is_active: true },
];

export const useGLAccounts = (associationId?: string) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountType, setAccountType] = useState<string>('all');
  const [activeOnly, setActiveOnly] = useState<boolean>(true);
  const queryClient = useQueryClient();

  // Fetch GL accounts (mock implementation)
  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['glAccounts', associationId],
    queryFn: async () => {
      // In a real implementation, we would fetch from Supabase
      // For now, return mock data
      let filteredAccounts = [...mockGLAccounts];
      
      if (associationId) {
        filteredAccounts = filteredAccounts.filter(account => account.association_id === associationId);
      }
      
      return filteredAccounts;
    },
  });

  // Create GL account mutation (mock implementation)
  const createGLAccount = useMutation({
    mutationFn: async (account: Partial<GLAccount>) => {
      // In a real implementation, this would be an insert to Supabase
      console.log('Creating GL account:', account);
      
      // Mock successful creation
      return { id: `mock-${Date.now()}` };
    },
    onSuccess: () => {
      toast.success('GL account created successfully');
      queryClient.invalidateQueries({ queryKey: ['glAccounts'] });
    },
    onError: (error) => {
      toast.error(`Failed to create GL account: ${error.message}`);
    }
  });

  // Update GL account mutation (mock implementation)
  const updateGLAccount = useMutation({
    mutationFn: async (account: GLAccount) => {
      // In a real implementation, this would be an update to Supabase
      console.log('Updating GL account:', account);
      
      // Mock successful update
      return { success: true };
    },
    onSuccess: () => {
      toast.success('GL account updated successfully');
      queryClient.invalidateQueries({ queryKey: ['glAccounts'] });
    },
    onError: (error) => {
      toast.error(`Failed to update GL account: ${error.message}`);
    }
  });

  // Delete GL account mutation (mock implementation)
  const deleteGLAccount = useMutation({
    mutationFn: async (accountId: string) => {
      // In a real implementation, this would be a delete from Supabase
      console.log('Deleting GL account:', accountId);
      
      // Mock successful deletion
      return { success: true };
    },
    onSuccess: () => {
      toast.success('GL account deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['glAccounts'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete GL account: ${error.message}`);
    }
  });

  // Add the refreshAccounts function to fix GLAccounts.tsx error
  const refreshAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ['glAccounts'] });
  };

  return {
    accounts,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    accountType,
    setAccountType,
    activeOnly,
    setActiveOnly,
    createGLAccount,
    updateGLAccount,
    deleteGLAccount,
    refreshAccounts // Added this function
  };
};
