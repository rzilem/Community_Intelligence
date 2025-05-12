
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSystemSetting, useUpdateSystemSetting } from '@/hooks/settings/use-system-settings';
import { Copy, Info, Save, Shield, Loader2 } from 'lucide-react';
import WebhookTester from './WebhookTester';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
  
  const [isSavingSecret, setIsSavingSecret] = useState(false);
  const [secretSaveError, setSecretSaveError] = useState<string | null>(null);
  const [secretSaveSuccess, setSecretSaveSuccess] = useState(false);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

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
          'homeowner-request-email': `${baseUrl}/functions/v1/homeowner-request-email`,
          'test-webhook': `${baseUrl}/functions/v1/test-webhook`
        });
      } catch (error) {
        console.error('Error getting webhook URLs:', error);
      }
    };
    
    fetchUrls();
  }, []);

  // This function only saves to the database
  const handleSaveDatabaseSettings = async () => {
    setIsSettingsSaved(false);
    
    // Save settings to the database
    updateWebhookSettings(settings, {
      onSuccess: () => {
        toast.success('Webhook settings saved to database');
        setIsSettingsSaved(true);
      },
      onError: (error) => {
        toast.error(`Failed to save webhook settings to database: ${error.message}`);
      }
    });
  };
  
  // This function only saves secrets to Supabase
  const saveSecretsToSupabase = async () => {
    setIsSavingSecret(true);
    setSecretSaveError(null);
    setSecretSaveSuccess(false);
    
    try {
      const promises = [];
      let hasSuccessfulSave = false;
      
      // Save the webhook secret if it exists
      if (settings.webhook_secret) {
        const webhookResult = await saveAsSupabaseSecret('WEBHOOK_SECRET', settings.webhook_secret);
        if (webhookResult.success) {
          hasSuccessfulSave = true;
        }
      }
      
      // Save the CloudMailin secret if it exists
      if (settings.cloudmailin_secret) {
        const cloudMailinResult = await saveAsSupabaseSecret('CLOUDMAILIN_SECRET', settings.cloudmailin_secret);
        if (cloudMailinResult.success) {
          hasSuccessfulSave = true;
        }
      }
      
      if (hasSuccessfulSave) {
        setSecretSaveSuccess(true);
        toast.success('Secrets saved successfully to Supabase');
      } else {
        toast.warning('No secrets were saved');
      }
    } catch (error: any) {
      setSecretSaveError(error.message);
      console.error('Error saving secrets to Supabase:', error);
      toast.error(`Error saving secrets: ${error.message}`);
    } finally {
      setIsSavingSecret(false);
    }
  };
  
  const saveAsSupabaseSecret = async (name: string, value: string) => {
    try {
      console.log(`Saving ${name} to Supabase secrets...`);
      
      // Call the update-secret function with proper error handling
      const { data, error } = await supabase.functions.invoke('update-secret', {
        body: { name, value }
      });
      
      // Check for errors from the edge function
      if (error) {
        console.error(`Error from Edge Function:`, error);
        throw new Error(`Failed to save secret: ${error.message}`);
      }
      
      // Get the data from the response
      if (!data) {
        console.error('No response received from update-secret function');
        throw new Error('No response received from update-secret function');
      }
      
      // Check if the data indicates success
      if (!data.success) {
        console.error('Secret save failed:', data);
        throw new Error(data.error || 'Unknown error saving secret');
      }
      
      console.log(`Secret ${name} saved successfully:`, data);
      return data;
    } catch (error: any) {
      console.error(`Error saving ${name} to Supabase:`, error);
      throw error;
    }
  };

  const handleSaveAll = async () => {
    // First save the database settings
    await handleSaveDatabaseSettings();
    
    // Then save the secrets
    await saveSecretsToSupabase();
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading webhook settings...</div>;
  }

  return (
    <div className="space-y-6">
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

          {secretSaveSuccess && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertTitle>Secrets saved successfully</AlertTitle>
              <AlertDescription>
                Your webhook secrets have been securely stored in Supabase.
              </AlertDescription>
            </Alert>
          )}

          {secretSaveError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Error saving secrets to Supabase</AlertTitle>
              <AlertDescription>
                <p>{secretSaveError}</p>
                <p className="mt-2">Your settings are saved locally but edge functions may not have access to them.</p>
              </AlertDescription>
            </Alert>
          )}

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
          
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button 
              onClick={handleSaveAll} 
              disabled={isPending || isSavingSecret}
            >
              {(isPending || isSavingSecret) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Webhook Settings
                </>
              )}
            </Button>
            
            <Button 
              onClick={saveSecretsToSupabase} 
              disabled={isSavingSecret || !settings.webhook_secret && !settings.cloudmailin_secret}
              variant="outline"
            >
              {isSavingSecret ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving Secrets...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Save Secrets Only
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-4" />
      
      <WebhookTester />
    </div>
  );
};

export default WebhookSettings;
