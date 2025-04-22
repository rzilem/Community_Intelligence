
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TestOpenAIButton = () => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const testConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      const response = await supabase.functions.invoke('test-openai', {
        method: 'POST',
      });
      
      if (response.error) {
        console.error('Connection test failed:', response.error);
        setTestResult('error');
        toast.error('Connection failed: ' + response.error.message);
        return;
      }
      
      const data = response.data as { success: boolean; message?: string; error?: string };
      
      if (data.success) {
        setTestResult('success');
        toast.success('OpenAI connection successful!');
      } else {
        console.error('Connection test failed:', data.error);
        setTestResult('error');
        toast.error('Connection failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error testing OpenAI connection:', error);
      setTestResult('error');
      toast.error('Connection test error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={testConnection} 
      disabled={testing}
      className={`${testResult === 'success' ? 'text-green-500 border-green-500' : 
                    testResult === 'error' ? 'text-red-500 border-red-500' : ''}`}
    >
      {testing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Testing...
        </>
      ) : testResult === 'success' ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Connection Successful
        </>
      ) : testResult === 'error' ? (
        <>
          <XCircle className="mr-2 h-4 w-4 text-red-500" />
          Connection Failed
        </>
      ) : (
        'Test Connection'
      )}
    </Button>
  );
};

export default TestOpenAIButton;
