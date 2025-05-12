
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSystemSetting, useUpdateSystemSetting } from '@/hooks/settings/use-system-settings';
import { Copy, Info, Save } from 'lucide-react';

interface WebhookSettings {
  cloudmailin_webhook_url?: string;
  cloudmailin_secret?: string;
  webhook_secret?: string;
}

const WebhookSettings = () => {
  const { data: webhookSettings, isLoading } = useSystemSetting<WebhookSettings>('webhook_settings');
  const { mutate: updateWebhookSettings, isPending } = useUpdateSystemSetting<WebhookSettings>('webhook_settings');
  
  const [settings, setSettings] = useState<WebhookSettings>({
    cloudmailin_webhook_url: '',
    cloudmailin_secret: '',
    webhook_secret: ''
  });

  // Generate the webhook URLs
  const [webhookUrls, setWebhookUrls] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    if (webhookSettings) {
      setSettings({
        cloudmailin_webhook_url: webhookSettings.cloudmailin_webhook_url || '',
        cloudmailin_secret: webhookSettings.cloudmailin_secret || '',
        webhook_secret: webhookSettings.webhook_secret || ''
      });
    }
  }, [webhookSettings]);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        // Get the root URL from supabase
        const { data: { publicUrl } } = await supabase.storage.from('public').getPublicUrl('dummy');
        // Extract the base URL
        const baseUrl = publicUrl.split('/storage/')[0];
        
        // Set the webhook URLs
        setWebhookUrls({
          'email-receiver': `${baseUrl}/functions/v1/email-receiver`,
          'invoice-receiver': `${baseUrl}/functions/v1/invoice-receiver`,
          'homeowner-request-email': `${baseUrl}/functions/v1/homeowner-request-email`
        });
      } catch (error) {
        console.error('Error getting webhook URLs:', error);
      }
    };
    
    fetchUrls();
  }, []);

  const handleSave = () => {
    updateWebhookSettings(settings, {
      onSuccess: () => {
        toast.success('Webhook settings saved successfully');
        
        // Also set the webhook secret as a Supabase secret
        if (settings.webhook_secret) {
          saveAsSupabaseSecret('WEBHOOK_SECRET', settings.webhook_secret);
        }
        if (settings.cloudmailin_secret) {
          saveAsSupabaseSecret('CLOUDMAILIN_SECRET', settings.cloudmailin_secret);
        }
      },
      onError: (error) => {
        toast.error(`Failed to save webhook settings: ${error.message}`);
      }
    });
  };
  
  const saveAsSupabaseSecret = async (name: string, value: string) => {
    try {
      const { error } = await supabase.functions.invoke('update-secret', {
        body: { name, value }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(`Secret ${name} saved to Supabase`);
    } catch (error) {
      console.error(`Error saving ${name} to Supabase:`, error);
      toast.error(`Error saving ${name} to Supabase. Your settings are saved locally but edge functions may not have access to them.`);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading webhook settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Settings</CardTitle>
        <CardDescription>
          Configure webhook endpoints for email processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="webhook-secret">Webhook Secret Key</Label>
          <Input
            id="webhook-secret"
            value={settings.webhook_secret || ''}
            onChange={(e) => setSettings({...settings, webhook_secret: e.target.value})}
            type="password"
            placeholder="Enter webhook secret key"
          />
          <p className="text-sm text-muted-foreground">
            This secret key is used to authenticate webhook requests
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cloudmailin-secret">CloudMailin Secret</Label>
          <Input
            id="cloudmailin-secret"
            value={settings.cloudmailin_secret || ''}
            onChange={(e) => setSettings({...settings, cloudmailin_secret: e.target.value})}
            type="password"
            placeholder="Enter CloudMailin secret"
          />
          <p className="text-sm text-muted-foreground">
            This is the secret key provided by CloudMailin for authenticating requests
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cloudmailin-webhook-url">CloudMailin Webhook URL</Label>
          <Input
            id="cloudmailin-webhook-url"
            value={settings.cloudmailin_webhook_url || ''}
            onChange={(e) => setSettings({...settings, cloudmailin_webhook_url: e.target.value})}
            placeholder="Enter CloudMailin webhook URL (if different from defaults)"
          />
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-md font-semibold mb-2">Your Webhook Endpoints</h3>
          <div className="space-y-3">
            {Object.entries(webhookUrls).map(([key, url]) => (
              <div key={key} className="p-3 border rounded-md bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{key}</p>
                    <p className="text-sm text-muted-foreground break-all">{url}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCopyUrl(url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-start mt-4 p-3 bg-blue-50 rounded-md">
            <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">CloudMailin Configuration:</p>
              <p>In CloudMailin, set the HTTP Post target to one of these endpoints and add a 
              HTTP header with name <code className="bg-blue-100 px-1 rounded">x-webhook-key</code> 
              and value of your webhook secret key.</p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={isPending}
          className="mt-4"
        >
          {isPending ? 'Saving...' : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Webhook Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WebhookSettings;
