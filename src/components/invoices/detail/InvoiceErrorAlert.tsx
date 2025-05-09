
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvoiceErrorAlertProps {
  error: string | null;
  details?: Record<string, any>;
}

export const InvoiceErrorAlert: React.FC<InvoiceErrorAlertProps> = ({ error, details }) => {
  const [testingAuth, setTestingAuth] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  if (!error) return null;
  
  // Check if error is related to authentication
  const isAuthError = error.toLowerCase().includes('401') || 
                      error.toLowerCase().includes('auth') || 
                      error.toLowerCase().includes('unauthorized');

  // Function to test the authentication
  const testAuthentication = async () => {
    try {
      setTestingAuth(true);
      setTestResult(null);
      
      const { data, error } = await supabase.functions.invoke('test-auth');
      
      if (error) {
        console.error("Auth test error:", error);
        setTestResult({ success: false, error: error.message });
        toast.error("Authentication test failed");
      } else {
        console.log("Auth test result:", data);
        setTestResult(data);
        if (data.authorization?.valid) {
          toast.success("Authentication test passed!");
        } else {
          toast.error("Authentication test failed");
        }
      }
    } catch (err) {
      console.error("Error testing authentication:", err);
      setTestResult({ success: false, error: err instanceof Error ? err.message : String(err) });
      toast.error("Error running authentication test");
    } finally {
      setTestingAuth(false);
    }
  };
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{isAuthError ? "Authentication Error" : "Error"}</AlertTitle>
      <AlertDescription>
        {error}
        
        {isAuthError && (
          <div className="mt-2 text-sm">
            <p>This may be due to an authentication issue between services. Please check:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>The SUPABASE_SERVICE_ROLE_KEY is correctly set in Supabase secrets</li>
              <li>The Authorization header format is correctly using Bearer token</li>
              <li>Check the logs for more detailed error information</li>
            </ul>
            
            <div className="mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={testAuthentication}
                disabled={testingAuth}
              >
                {testingAuth ? 'Testing...' : 'Test Authentication'}
              </Button>
              
              {testResult && (
                <div className="mt-2 p-2 bg-slate-900 text-white text-xs rounded overflow-auto">
                  <div className="font-bold">Test Result:</div>
                  <div>{testResult.success ? '✅ Success' : '❌ Failed'}</div>
                  
                  {testResult.authorization && (
                    <div className="mt-1">
                      <div className="font-bold">Authorization:</div>
                      <div>Status: {testResult.authorization.valid ? '✅ Valid' : '❌ Invalid'}</div>
                      <div>Message: {testResult.authorization.message}</div>
                      {testResult.authorization.details && (
                        <div>Details: {testResult.authorization.details}</div>
                      )}
                    </div>
                  )}
                  
                  {testResult.client && (
                    <div className="mt-1">
                      <div className="font-bold">Client Test:</div>
                      <div>{testResult.client.message}</div>
                    </div>
                  )}
                  
                  {testResult.environment && (
                    <div className="mt-1">
                      <div className="font-bold">Environment:</div>
                      <div>SUPABASE_URL: {testResult.environment.hasSupabaseUrl ? '✅ Set' : '❌ Missing'}</div>
                      <div>SUPABASE_SERVICE_ROLE_KEY: {testResult.environment.hasServiceRoleKey ? '✅ Set' : '❌ Missing'}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {details && (
          <pre className="mt-2 text-xs bg-slate-800 text-white p-2 rounded overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        )}
      </AlertDescription>
    </Alert>
  );
};
