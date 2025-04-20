
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';
import GLAccountTabs from '@/components/accounting/GLAccountTabs';
import { GLAccount } from '@/types/accounting-types';
import { useAuth } from '@/contexts/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const GLAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountType, setAccountType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('master');
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const handleAccountAdded = (newAccount: GLAccount) => {
    setAccounts(prevAccounts => [...prevAccounts, newAccount]);
  };

  // Load appropriate GL accounts based on active tab and selected association
  useEffect(() => {
    async function fetchGLAccounts() {
      setLoading(true);
      try {
        let query = supabase.from('gl_accounts').select('*');
        
        if (activeTab === 'master') {
          // Fetch master chart (global accounts)
          query = query.eq('association_id', null);
        } else if (activeTab === 'association' && selectedAssociationId) {
          // Fetch association-specific accounts
          query = query.eq('association_id', selectedAssociationId);
        } else {
          // No association selected for association tab
          setAccounts([]);
          setLoading(false);
          return;
        }
        
        // Execute query and sort by code
        const { data, error } = await query.order('code', { ascending: true });
        
        if (error) {
          console.error('Error fetching GL accounts:', error);
          toast.error('Failed to load GL accounts');
        } else if (data) {
          setAccounts(data as GLAccount[]);
        }
      } catch (err) {
        console.error('Error in fetchGLAccounts:', err);
        toast.error('An error occurred while fetching GL accounts');
      } finally {
        setLoading(false);
      }
    }

    fetchGLAccounts();
  }, [activeTab, selectedAssociationId]);

  // Function to copy master GL accounts to an association
  const handleCopyMasterToAssociation = async () => {
    if (!selectedAssociationId) {
      toast.error('Please select an association first');
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch all master GL accounts
      const { data: masterAccounts, error: fetchError } = await supabase
        .from('gl_accounts')
        .select('*')
        .eq('association_id', null);

      if (fetchError) {
        throw new Error(`Error fetching master accounts: ${fetchError.message}`);
      }

      if (!masterAccounts || masterAccounts.length === 0) {
        toast.warning('No master GL accounts found to copy');
        setLoading(false);
        return;
      }

      // 2. Prepare data for insert - clone accounts but set association_id
      const accountsToInsert = masterAccounts.map(account => ({
        code: account.code,
        name: account.name,
        type: account.type,
        description: account.description || account.name,
        category: account.category,
        balance: 0,
        association_id: selectedAssociationId
      }));

      // 3. Insert association-specific GL accounts
      const { data, error } = await supabase
        .from('gl_accounts')
        .insert(accountsToInsert)
        .select();

      if (error) {
        throw new Error(`Error copying GL accounts: ${error.message}`);
      }

      toast.success(`Successfully copied ${accountsToInsert.length} GL accounts to association`);
      
      // If we're on the association tab, refresh the list
      if (activeTab === 'association') {
        const { data: updatedAccounts } = await supabase
          .from('gl_accounts')
          .select('*')
          .eq('association_id', selectedAssociationId)
          .order('code', { ascending: true });
          
        if (updatedAccounts) {
          setAccounts(updatedAccounts as GLAccount[]);
        }
      }
    } catch (err: any) {
      console.error('Error copying master GL accounts:', err);
      toast.error(err.message || 'Failed to copy GL accounts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTemplate 
      title="GL Accounts" 
      icon={<Database className="h-8 w-8" />}
      description="Manage general ledger accounts and chart of accounts."
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>Manage general ledger accounts for your associations</CardDescription>
            </div>
            <AssociationSelector 
              className="md:self-end" 
              onAssociationChange={handleAssociationChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <GLAccountTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            accounts={accounts}
            searchTerm={searchTerm}
            accountType={accountType}
            onSearchChange={setSearchTerm}
            onAccountTypeChange={setAccountType}
            onAccountAdded={handleAccountAdded}
            selectedAssociationId={selectedAssociationId}
            onCopyMasterToAssociation={handleCopyMasterToAssociation}
          />
          {loading && <div className="text-center text-sm text-gray-400 mt-4">Loading...</div>}
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default GLAccounts;
