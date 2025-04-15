
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { DollarSign, Zap } from 'lucide-react';
import { useSystemSetting } from '@/hooks/settings/use-system-settings';
import { IntegrationSettings } from '@/types/settings-types';
import { Button } from '@/components/ui/button';

const Accounting = () => {
  const navigate = useNavigate();
  const { data: integrationSettings } = useSystemSetting<IntegrationSettings>('integrations');
  
  const hasOpenAI = integrationSettings?.integrationSettings?.['OpenAI']?.apiKey;
  
  useEffect(() => {
    // Redirect to accounting dashboard
    navigate('/accounting/dashboard');
  }, [navigate]);
  
  return (
    <PageTemplate 
      title="Accounting" 
      icon={<DollarSign className="h-8 w-8" />}
      description="Manage finances, budgets, and transactions for your associations."
      actions={
        !hasOpenAI && (
          <Button 
            variant="outline" 
            onClick={() => navigate('/system/settings')}
            className="flex items-center"
          >
            <Zap className="h-4 w-4 mr-2 text-amber-500" />
            Add AI-Powered Features
          </Button>
        )
      }
    />
  );
};

export default Accounting;
