
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TestTube, Loader2, CheckCircle, XCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  details?: any;
}

export function InvoiceProcessingTest() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [testResult, setTestResult] = React.useState<TestResult | null>(null);
  const [testEmail, setTestEmail] = React.useState(`{
  "from": "vendor@example.com",
  "to": "invoices@yourdomain.com",
  "subject": "Invoice #12345 - Web Development Services",
  "text": "Please find attached invoice #12345 for web development services. Amount due: $2,500.00. Due date: 2024-07-15.",
  "html": "<p>Please find attached invoice #12345 for web development services.</p><p>Amount due: $2,500.00</p><p>Due date: 2024-07-15</p>",
  "attachments": []
}`);

  const testInvoiceProcessing = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // Validate JSON first
      let emailData;
      try {
        emailData = JSON.parse(testEmail);
      } catch (parseError) {
        throw new Error('Invalid JSON format in test email data');
      }
      
      console.log('Testing invoice processing with data:', emailData);
      
      const { data, error } = await supabase.functions.invoke('invoice-receiver', {
        body: emailData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        // Check if it's an authentication error
        if (error.message?.includes('401') || error.message?.includes('authentication')) {
          setTestResult({
            success: false,
            message: 'Authentication Error - Check Webhook Configuration',
            error: error.message,
            details: {
              hint: 'This suggests CloudMailin webhook secret is not configured properly',
              nextSteps: [
                'Configure webhook secret in the section above',
                'Ensure CloudMailin is configured with the same secret',
                'Check Supabase Edge Function logs for more details'
              ]
            }
          });
        } else {
          setTestResult({
            success: false,
            message: 'Function invocation failed',
            error: error.message,
            details: error
          });
        }
        return;
      }

      // Check the response data
      if (data && data.success) {
        setTestResult({
          success: true,
          message: 'Invoice processed successfully with AI analysis!',
          data,
          details: {
            trackingNumber: data.tracking_number,
            invoiceId: data.invoice_id,
            requestId: data.requestId
          }
        });
        toast.success('Invoice processing test completed successfully');
      } else {
        setTestResult({
          success: false,
          message: data?.error || 'Unknown error occurred',
          error: data?.error,
          details: data
        });
      }
    } catch (error: any) {
      console.error('Test failed:', error);
      
      setTestResult({
        success: false,
        message: 'Test execution failed',
        error: error.message || 'Unknown error',
        details: {
          type: 'client_error',
          suggestion: 'Check console logs for more details'
        }
      });
      
      toast.error(`Test failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openEdgeFunctionLogs = () => {
    window.open('https://supabase.com/dashboard/project/cahergndkwfqltxyikyr/functions/invoice-receiver/logs', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-purple-500" />
          Invoice Processing Test
        </CardTitle>
        <CardDescription>
          Test the complete CloudMailin → AI → Database pipeline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This test simulates CloudMailin sending invoice data to your webhook. Ensure webhook secret is configured above before testing.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Data (JSON)</Label>
          <Textarea
            id="test-email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="h-40 font-mono text-sm"
            placeholder="Enter test email JSON data..."
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={testInvoiceProcessing}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Test...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test Invoice Processing
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={openEdgeFunctionLogs}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Logs
          </Button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <h4 className={`font-medium ${
                testResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {testResult.message}
              </h4>
            </div>
            
            {testResult.data && (
              <div className="mt-2">
                <p className="text-sm text-green-800 mb-1">Response:</p>
                <pre className="text-xs bg-green-100 p-2 rounded overflow-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
            
            {testResult.error && (
              <div className="mt-2">
                <p className="text-sm text-red-800 font-medium">Error:</p>
                <p className="text-sm text-red-700">{testResult.error}</p>
              </div>
            )}
            
            {testResult.details && (
              <div className="mt-3">
                {testResult.details.hint && (
                  <p className="text-sm font-medium mb-1">💡 {testResult.details.hint}</p>
                )}
                
                {testResult.details.nextSteps && (
                  <div>
                    <p className="text-sm font-medium mb-1">Next Steps:</p>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {testResult.details.nextSteps.map((step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {testResult.details.trackingNumber && (
                  <div className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded">
                    <p><strong>Tracking #:</strong> {testResult.details.trackingNumber}</p>
                    {testResult.details.invoiceId && (
                      <p><strong>Invoice ID:</strong> {testResult.details.invoiceId}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Complete Test Flow:</strong> This test validates email parsing → AI analysis → invoice extraction → database storage.
            A successful test means your entire CloudMailin + OpenAI pipeline is working correctly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
