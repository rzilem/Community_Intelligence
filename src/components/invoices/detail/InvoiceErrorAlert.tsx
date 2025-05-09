
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface InvoiceErrorAlertProps {
  error: string | null;
  details?: Record<string, any>;
}

export const InvoiceErrorAlert: React.FC<InvoiceErrorAlertProps> = ({ error, details }) => {
  if (!error) return null;
  
  // Check if error is related to authentication
  const isAuthError = error.toLowerCase().includes('401') || 
                      error.toLowerCase().includes('auth') || 
                      error.toLowerCase().includes('unauthorized');
  
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
