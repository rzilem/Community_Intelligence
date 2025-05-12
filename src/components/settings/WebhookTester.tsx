
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Send, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useSystemSetting } from '@/hooks/settings/use-system-settings';
import { toast } from 'sonner';

const WebhookTester = () => {
  const { data: webhookSettings } = useSystemSetting<{
    webhook_secret?: string;
    cloudmailin_secret?: string;
  }>('webhook_settings');
  
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    requestId?: string;
    authStatus?: {
      hasWebhookSecret: boolean;
      isValidWebhook: boolean;
      authMethod: string;
    };
    requestInfo?: {
      method: string;
      headers: Record<string, string>;
    };
    error?: string;
  } | null>(null);
  
  const handleTestWebhook = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add webhook key header if it exists
      if (webhookSettings?.webhook_secret) {
        headers['x-webhook-key'] = webhookSettings.webhook_secret;
      }
      
      console.log('Testing webhook with headers:', JSON.stringify({
        contentType: headers['Content-Type'],
        hasWebhookKey: !!headers['x-webhook-key']
      }));
      
      // Call the test webhook function with proper error handling
      const { data, error } = await supabase.functions.invoke('test-webhook', {
        body: { 
          testData: 'This is a webhook test', 
          timestamp: new Date().toISOString(),
          secretTest: true
        },
        headers
      });
      
      console.log('Webhook test response:', { data, error });
      
      if (error) {
        throw new Error(`Failed to test webhook: ${error.message}`);
      }
      
      setTestResult(data || { 
        success: false, 
        message: 'No data returned from webhook test' 
      });
      
      if (data?.success) {
        toast.success('Webhook test completed successfully');
      } else if (data) {
        toast.error(`Webhook test failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error testing webhook:', error);
      setTestResult({
        success: false,
        message: error.message || 'An unknown error occurred',
        error: error.toString()
      });
      toast.error(`Webhook test failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthStatusLabel = () => {
    if (!testResult?.authStatus) return null;
    
    const { isValidWebhook, authMethod } = testResult.authStatus;
    
    if (!isValidWebhook) {
      return (
        <Badge variant="destructive" className="ml-2">
          Authentication Failed
        </Badge>
      );
    }
    
    return (
      <Badge variant="success" className="ml-2">
        Auth: {authMethod}
      </Badge>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Test Webhook Configuration</span>
          {testResult?.success && <CheckCircle className="h-5 w-5 text-green-500" />}
        </CardTitle>
        <CardDescription>
          Verify your webhook configuration is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!webhookSettings?.webhook_secret && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No webhook secret configured</AlertTitle>
            <AlertDescription>
              Configure a webhook secret key in the settings above and make sure to click "Save Webhook Settings" button.
            </AlertDescription>
          </Alert>
        )}
        
        {testResult && (
          <div className="mb-4 space-y-3 border rounded-md p-3">
            <div className="flex items-center">
              <strong className="mr-2">Status:</strong>
              {testResult.success ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Success
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Failed
                </Badge>
              )}
              {getAuthStatusLabel()}
            </div>
            
            {testResult.requestId && (
              <div className="text-sm">
                <strong>Request ID:</strong> {testResult.requestId}
              </div>
            )}
            
            {testResult.message && (
              <div className="text-sm">
                <strong>Message:</strong> {testResult.message}
              </div>
            )}
            
            {testResult.error && (
              <div className="text-sm text-red-600">
                <strong>Error:</strong> {testResult.error}
              </div>
            )}
            
            {testResult.authStatus && (
              <div className="text-sm">
                <strong>Webhook Secret:</strong>{' '}
                {testResult.authStatus.hasWebhookSecret ? 'Configured' : 'Not configured'}
              </div>
            )}
            
            {testResult.requestInfo && (
              <div className="text-sm">
                <strong>Request Method:</strong> {testResult.requestInfo.method}
              </div>
            )}
          </div>
        )}
        
        <p className="text-sm text-muted-foreground mb-4">
          This test sends a request to your webhook endpoint with your configured webhook secret 
          to verify the authentication is working properly.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTestWebhook} 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Test Webhook Configuration
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebhookTester;
