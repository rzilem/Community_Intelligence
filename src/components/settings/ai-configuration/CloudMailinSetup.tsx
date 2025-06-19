
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function CloudMailinSetup() {
  const [webhookUrl, setWebhookUrl] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    // Set the webhook URL based on the current environment
    const url = `https://cahergndkwfqltxyikyr.supabase.co/functions/v1/invoice-receiver`;
    setWebhookUrl(url);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Webhook URL copied to clipboard');
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
          CloudMailin Integration
        </CardTitle>
        <CardDescription>
          Configure CloudMailin to forward invoice emails to your system for AI processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Create a CloudMailin account at cloudmailin.com</li>
            <li>2. Create a new address and configure the webhook URL below</li>
            <li>3. Set the format to "Multipart (Ruby/Rails)"</li>
            <li>4. Configure authentication using the webhook secret</li>
            <li>5. Forward invoice emails to your CloudMailin address</li>
          </ol>
        </div>

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
          <p className="text-sm text-muted-foreground">
            Use this URL in your CloudMailin webhook configuration
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Authentication Setup:</h4>
          <p className="text-sm text-yellow-800 mb-2">
            To secure your webhook, add a secret called <code className="bg-yellow-100 px-1 rounded">CLOUDMAILIN_WEBHOOK_SECRET</code> in your Supabase Edge Function secrets.
          </p>
          <p className="text-sm text-yellow-800">
            Then configure CloudMailin to send this secret in the Authorization header.
          </p>
        </div>

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
        </div>
      </CardContent>
    </Card>
  );
}
