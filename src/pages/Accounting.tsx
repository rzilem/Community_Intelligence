
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { DollarSign, Zap } from 'lucide-react';
import { useSystemSetting } from '@/hooks/settings/use-system-settings';
import { IntegrationSettings } from '@/types/settings-types';
import { Button } from '@/components/ui/button';

const Accounting = () => {
  const navigate = useNavigate();
  
  // Comment out the system settings hook temporarily to avoid dependency issues
  // const { data: integrationSettings } = useSystemSetting<IntegrationSettings>('integrations');
  // const hasOpenAI = integrationSettings?.integrationSettings?.['OpenAI']?.apiKey;
  const hasOpenAI = false; // Temporary fallback
  
  useEffect(() => {
    // Add a small delay to ensure navigation works properly
    const timer = setTimeout(() => {
      console.log('Redirecting to accounting dashboard from /accounting');
      navigate('/accounting/dashboard');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  // Show a loading state while redirecting
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
    >
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Redirecting to Accounting Dashboard...</p>
        </div>
      </div>
    </PageTemplate>
  );
};

export default Accounting;
