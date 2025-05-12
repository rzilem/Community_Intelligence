
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  message: string;
  requestId: string;
  authStatus: {
    hasWebhookSecret: boolean;
    isValidWebhook: boolean;
    authMethod: string;
  };
  requestInfo: {
    method: string;
    url: string;
    headers: Record<string, string>;
  };
  bodyData: any;
  timestamp: string;
}

const WebhookTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [webhookKey, setWebhookKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('email-receiver');
  const [jsonPayload, setJsonPayload] = useState('{\n  "from": "test@example.com",\n  "subject": "Test Email",\n  "text": "This is a test email"\n}');
  
  const endpointOptions = [
    { value: 'email-receiver', label: 'Email Receiver' },
    { value: 'invoice-receiver', label: 'Invoice Receiver' },
    { value: 'homeowner-request-email', label: 'Homeowner Request' },
    { value: 'test-webhook', label: 'Test Webhook' }
  ];

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Get the root URL from supabase
      const { data: { publicUrl } } = await supabase.storage.from('public').getPublicUrl('dummy');
      // Extract the base URL
      const baseUrl = publicUrl.split('/storage/')[0];
      
      // Determine target URL
      let targetUrl = webhookUrl;
      if (!targetUrl) {
        targetUrl = `${baseUrl}/functions/v1/${selectedEndpoint}`;
      }
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (webhookKey) {
        headers['x-webhook-key'] = webhookKey;
      }
      
      // Parse JSON payload
      let payload = {};
      try {
        payload = JSON.parse(jsonPayload);
      } catch (error) {
        toast.error('Invalid JSON payload. Using empty object instead.');
      }
      
      // Make the request
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      setTestResult(result);
      
      if (response.ok) {
        toast.success('Webhook test completed successfully!');
      } else {
        toast.error(`Webhook test failed: ${result.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Error testing webhook. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Webhook Tester</CardTitle>
        <CardDescription>
          Test your webhook endpoints with different authentication methods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="endpoint" className="space-y-4">
          <TabsList>
            <TabsTrigger value="endpoint">Endpoint</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="payload">Payload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="endpoint" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="endpoint-selector">Select Endpoint</Label>
                <select 
                  className="mt-1 w-full p-2 border rounded-md" 
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                >
                  {endpointOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="custom-url">Custom URL (Optional)</Label>
                <Input 
                  id="custom-url" 
                  placeholder="https://your-project.supabase.co/functions/v1/endpoint" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use the selected endpoint above
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="auth" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="webhook-key">Webhook Secret / Key</Label>
              <Input 
                id="webhook-key" 
                placeholder="Enter the webhook secret key" 
                value={webhookKey}
                onChange={(e) => setWebhookKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will be sent as the x-webhook-key header with your request
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="payload" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="json-payload">JSON Payload</Label>
              <Textarea 
                id="json-payload" 
                rows={10} 
                className="font-mono text-sm"
                value={jsonPayload}
                onChange={(e) => setJsonPayload(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button 
            onClick={handleTest}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : 'Test Webhook'}
          </Button>
        </div>
        
        {testResult && (
          <div className="mt-6">
            <div className="mb-2 flex items-center">
              <h3 className="text-lg font-semibold">Test Result</h3>
              {testResult.success ? (
                <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="ml-2 h-5 w-5 text-red-500" />
              )}
            </div>
            
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Status:</span> 
                    <span className={testResult.success ? "text-green-500 ml-1" : "text-red-500 ml-1"}>
                      {testResult.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-semibold">Message:</span>
                    <span className="ml-1">{testResult.message}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold">Request ID:</span>
                    <span className="ml-1">{testResult.requestId}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold">Timestamp:</span>
                    <span className="ml-1">{new Date(testResult.timestamp).toLocaleString()}</span>
                  </div>
                  
                  {testResult.authStatus && (
                    <div className="mt-2">
                      <div className="font-semibold mb-1">Authentication:</div>
                      <div className="bg-muted p-2 rounded-md text-sm">
                        <div>Has Webhook Secret: {testResult.authStatus.hasWebhookSecret ? 'Yes' : 'No'}</div>
                        <div>Valid Authentication: {testResult.authStatus.isValidWebhook ? 'Yes' : 'No'}</div>
                        <div>Auth Method: {testResult.authStatus.authMethod}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <details className="mt-2">
              <summary className="cursor-pointer font-medium text-sm text-muted-foreground">
                View Full Response
              </summary>
              <pre className="mt-2 bg-muted p-4 rounded-md overflow-auto text-xs max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookTester;
