
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import SupabaseDiagnostics from '@/components/auth/SupabaseDiagnostics';

const SupabaseStatus: React.FC = () => {
  const [supabaseStatus, setSupabaseStatus] = useState('Checking connection...');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles' as any)
          .select('count')
          .limit(1);
          
        if (error) {
          console.error('Supabase connection error:', error);
          setSupabaseStatus(`Connection error: ${error.message}`);
        } else {
          console.log('Supabase connected successfully', data);
          setSupabaseStatus('Connected to Supabase successfully');
        }
      } catch (err) {
        console.error('Unexpected error checking Supabase:', err);
        setSupabaseStatus(`Unexpected error: ${String(err)}`);
      }
    };

    checkConnection();
  }, []);

  return (
    <>
      <div className="mt-2 p-2 bg-blue-50 text-sm rounded border border-blue-200">
        <p className="font-medium">Supabase Status: <span className={supabaseStatus.includes('error') ? 'text-red-500' : 'text-green-500'}>{supabaseStatus}</span></p>
        <Button 
          variant="link" 
          className="text-xs p-0 h-6"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
        >
          {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
        </Button>
      </div>
      {showDiagnostics && <SupabaseDiagnostics />}
    </>
  );
};

export default SupabaseStatus;
