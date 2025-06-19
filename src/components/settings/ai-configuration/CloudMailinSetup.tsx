
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ExternalLink, Copy, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CloudMailinSetup() {
  const [webhookUrl, setWebhookUrl] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [webhookSecret, setWebhookSecret] = React.useState('');

  React.useEffect(() => {
    // Set the webhook URL based on the current environment
    const url = `https://cahergndkwfqltxyikyr.supabase.co/functions/v1/invoice-receiver`;
    setWebhookUrl(url);
    
    // Generate a random webhook secret for demonstration
    const secret = `cm_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setWebhookSecret(secret);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          CloudMailin Integration Setup
        </CardTitle>
        <CardDescription>
          Complete CloudMailin configuration to forward invoice emails for AI processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> You must configure authentication in both Supabase secrets and CloudMailin dashboard for this integration to work.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="webhook-config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="webhook-config">Webhook Config</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhook-config" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrl)}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">CloudMailin Dashboard Configuration:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Create a CloudMailin account at cloudmailin.com</li>
                <li>2. Create a new address and paste the webhook URL above</li>
                <li>3. Set the format to "Multipart (Ruby/Rails)"</li>
                <li>4. Configure authentication (see Authentication tab)</li>
                <li>5. Save and test the configuration</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Choose one of the authentication methods below. We recommend Custom Header for simplicity.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Recommended: Custom Header</h4>
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Webhook Secret</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhook-secret"
                      value={webhookSecret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(webhookSecret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-green-800">
                  <p><strong>Step 1:</strong> Copy the webhook secret above</p>
                  <p><strong>Step 2:</strong> Add it as <code className="bg-green-100 px-1 rounded">CLOUDMAILIN_WEBHOOK_SECRET</code> in Supabase Edge Function secrets</p>
                  <p><strong>Step 3:</strong> In CloudMailin dashboard, add custom header:</p>
                  <ul className="ml-4 mt-1">
                    <li>• Header Name: <code className="bg-green-100 px-1 rounded">X-Webhook-Signature</code></li>
                    <li>• Header Value: <code className="bg-green-100 px-1 rounded">{webhookSecret}</code></li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Alternative: HTTP Basic Auth</h4>
                <div className="text-sm text-gray-700">
                  <p><strong>CloudMailin Configuration:</strong></p>
                  <ul className="ml-4 mt-1">
                    <li>• Username: <code className="bg-gray-100 px-1 rounded">cloudmailin</code></li>
                    <li>• Password: <code className="bg-gray-100 px-1 rounded">{webhookSecret}</code></li>
                  </ul>
                  <p className="mt-2"><strong>Supabase Secret:</strong> Same as above</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Alternative: Bearer Token</h4>
                <div className="text-sm text-gray-700">
                  <p><strong>CloudMailin Configuration:</strong></p>
                  <ul className="ml-4 mt-1">
                    <li>• Authorization: <code className="bg-gray-100 px-1 rounded">Bearer {webhookSecret}</code></li>
                  </ul>
                  <p className="mt-2"><strong>Supabase Secret:</strong> Same as above</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Testing Steps:</h4>
              <ol className="text-sm text-yellow-800 space-y-1">
                <li>1. Configure authentication in both Supabase and CloudMailin</li>
                <li>2. Use the "Invoice Processing Test" component to test the endpoint</li>
                <li>3. Send a real test email through CloudMailin</li>
                <li>4. Check Supabase Edge Function logs for debugging</li>
                <li>5. Verify processed invoices appear in the Invoice Queue</li>
              </ol>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                If you encounter 401 errors, double-check that the webhook secret matches exactly in both Supabase secrets and CloudMailin configuration.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a 
              href="https://www.cloudmailin.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open CloudMailin
            </a>
          </Button>
          <Button asChild variant="outline">
            <a 
              href="https://supabase.com/dashboard/project/cahergndkwfqltxyikyr/settings/functions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Supabase Edge Function Secrets
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
