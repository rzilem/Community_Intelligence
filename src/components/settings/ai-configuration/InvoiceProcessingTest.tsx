
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TestTube, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
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
      const emailData = JSON.parse(testEmail);
      
      const { data, error } = await supabase.functions.invoke('invoice-receiver', {
        body: emailData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        throw error;
      }

      setTestResult({
        success: true,
        message: 'Invoice processed successfully!',
        data
      });
      
      toast.success('Invoice processing test completed successfully');
    } catch (error: any) {
      console.error('Test failed:', error);
      
      setTestResult({
        success: false,
        message: 'Invoice processing failed',
        error: error.message || 'Unknown error'
      });
      
      toast.error(`Test failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-purple-500" />
          Invoice Processing Test
        </CardTitle>
        <CardDescription>
          Test the complete invoice processing pipeline including OpenAI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <Button 
          onClick={testInvoiceProcessing}
          disabled={isLoading}
          className="w-full"
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
              <p className="text-sm text-red-800 mt-2">
                Error: {testResult.error}
              </p>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This test simulates the invoice processing pipeline. 
            A successful test means your OpenAI integration and invoice processing logic are working correctly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
