
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';
import GLAccountTabs from '@/components/accounting/GLAccountTabs';
import { GLAccount } from '@/types/accounting-types';
import { useAuth } from '@/contexts/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';

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

  // Load master chart from Supabase
  useEffect(() => {
    async function fetchMasterGLs() {
      setLoading(true);
      const { data, error } = await supabase
        .from('gl_accounts')
        .select('*')
        .eq('association_id', null)
        .order('code', { ascending: true }); // Sorted by code
      if (!error && data) {
        setAccounts(data as GLAccount[]);
      }
      setLoading(false);
    }

    if (activeTab === 'master') {
      fetchMasterGLs();
    } else {
      // you could load association-specific GLs here with .eq('association_id', selectedAssociationId)
      setAccounts([]);
    }
  }, [activeTab, selectedAssociationId]);

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
          />
          {loading && <div className="text-center text-sm text-gray-400 mt-4">Loading...</div>}
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default GLAccounts;
