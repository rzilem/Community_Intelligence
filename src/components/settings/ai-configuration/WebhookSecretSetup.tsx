
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Copy, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function WebhookSecretSetup() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [currentSecret, setCurrentSecret] = React.useState('');
  const [newSecret, setNewSecret] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const generateSecret = () => {
    const secret = `cm_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setNewSecret(secret);
  };

  const loadCurrentSecret = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_secret', {
        secret_name: 'CLOUDMAILIN_WEBHOOK_SECRET'
      });

      if (!error && data) {
        setCurrentSecret(data);
        setNewSecret(data);
        toast.success('Current webhook secret loaded');
      } else {
        console.log('No existing webhook secret found');
        generateSecret();
      }
    } catch (error) {
      console.error('Error loading webhook secret:', error);
      toast.error('Failed to load current webhook secret');
      generateSecret();
    } finally {
      setIsLoading(false);
    }
  };

  const saveSecret = async () => {
    if (!newSecret.trim()) {
      toast.error('Please enter a webhook secret');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.rpc('set_secret', {
        secret_name: 'CLOUDMAILIN_WEBHOOK_SECRET',
        secret_value: newSecret
      });

      if (error) {
        throw error;
      }

      setCurrentSecret(newSecret);
      toast.success('Webhook secret saved successfully');
    } catch (error) {
      console.error('Error saving webhook secret:', error);
      toast.error('Failed to save webhook secret');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Secret copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  React.useEffect(() => {
    loadCurrentSecret();
  }, []);

  React.useEffect(() => {
    if (!newSecret) {
      generateSecret();
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Webhook Secret Configuration
        </CardTitle>
        <CardDescription>
          Configure the webhook secret for secure CloudMailin authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <p className="text-sm text-blue-800">
            This secret will be stored securely in Supabase and used to authenticate incoming CloudMailin webhooks. 
            You'll need to configure CloudMailin to send this same secret in the request headers.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="current-secret">Current Webhook Secret</Label>
          <div className="flex gap-2">
            <Input
              id="current-secret"
              value={currentSecret}
              readOnly
              placeholder={isLoading ? "Loading..." : "No secret configured"}
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={loadCurrentSecret}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="new-secret">New Webhook Secret</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={generateSecret}
            >
              Generate New
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              id="new-secret"
              value={newSecret}
              onChange={(e) => setNewSecret(e.target.value)}
              className="font-mono text-sm"
              placeholder="Enter or generate webhook secret"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(newSecret)}
              disabled={!newSecret}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={saveSecret}
            disabled={isSaving || !newSecret.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Secret'}
          </Button>
          <Button asChild variant="outline">
            <a 
              href="https://supabase.com/dashboard/project/cahergndkwfqltxyikyr/settings/functions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View in Supabase
            </a>
          </Button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Next Steps:</h4>
          <ol className="text-sm text-yellow-800 space-y-1">
            <li>1. Save the webhook secret above</li>
            <li>2. Copy the secret to your clipboard</li>
            <li>3. In CloudMailin dashboard, configure authentication with this secret</li>
            <li>4. Test the integration using the Invoice Processing Test component</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
