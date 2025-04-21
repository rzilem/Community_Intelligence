
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const FormBuilderSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    enableEmbedding: true,
    requireApproval: false,
    notifyAdmins: true,
    autoSave: true,
    defaultRedirectUrl: '',
    defaultSubmitText: 'Submit',
    defaultThankYouMessage: 'Thank you for your submission. We will review it shortly.'
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    requireCaptcha: true,
    throttleSubmissions: true,
    maxUploadsPerForm: 5,
    allowedFileTypes: '.pdf,.jpg,.png,.doc,.docx',
    maxFileSize: 10, // MB
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    adminEmail: '',
    emailTemplate: '',
  });
  
  const [integrationSettings, setIntegrationSettings] = useState({
    defaultEndpointType: 'external',
    defaultEndpointUrl: '',
    allowPortalWidget: true,
    defaultWorkflowType: 'homeowner_request',
  });
  
  const handleSaveSettings = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };
  
  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure general form settings and defaults
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Form Embedding</Label>
                <p className="text-sm text-muted-foreground">
                  Allow forms to be embedded on external websites
                </p>
              </div>
              <Switch 
                checked={generalSettings.enableEmbedding} 
                onCheckedChange={(checked) => setGeneralSettings({...generalSettings, enableEmbedding: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval for Submissions</Label>
                <p className="text-sm text-muted-foreground">
                  Require admin approval before processing form submissions
                </p>
              </div>
              <Switch 
                checked={generalSettings.requireApproval} 
                onCheckedChange={(checked) => setGeneralSettings({...generalSettings, requireApproval: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notify Administrators</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications to admins for new form submissions
                </p>
              </div>
              <Switch 
                checked={generalSettings.notifyAdmins} 
                onCheckedChange={(checked) => setGeneralSettings({...generalSettings, notifyAdmins: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save Form Progress</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save form progress for users
                </p>
              </div>
              <Switch 
                checked={generalSettings.autoSave} 
                onCheckedChange={(checked) => setGeneralSettings({...generalSettings, autoSave: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultRedirectUrl">Default Redirect URL</Label>
              <Input 
                id="defaultRedirectUrl" 
                value={generalSettings.defaultRedirectUrl} 
                onChange={(e) => setGeneralSettings({...generalSettings, defaultRedirectUrl: e.target.value})}
                placeholder="https://example.com/thank-you"
              />
              <p className="text-sm text-muted-foreground">
                Where to redirect users after form submission (if not specified in the form)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultSubmitText">Default Submit Button Text</Label>
              <Input 
                id="defaultSubmitText" 
                value={generalSettings.defaultSubmitText} 
                onChange={(e) => setGeneralSettings({...generalSettings, defaultSubmitText: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultThankYouMessage">Default Thank You Message</Label>
              <Textarea 
                id="defaultThankYouMessage" 
                value={generalSettings.defaultThankYouMessage} 
                onChange={(e) => setGeneralSettings({...generalSettings, defaultThankYouMessage: e.target.value})}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSaveSettings('General')}>Save Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Configure security settings for your forms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require CAPTCHA</Label>
                <p className="text-sm text-muted-foreground">
                  Protect forms from spam submissions with CAPTCHA
                </p>
              </div>
              <Switch 
                checked={securitySettings.requireCaptcha} 
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireCaptcha: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Throttle Submissions</Label>
                <p className="text-sm text-muted-foreground">
                  Limit submission rate to prevent abuse
                </p>
              </div>
              <Switch 
                checked={securitySettings.throttleSubmissions} 
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, throttleSubmissions: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxUploadsPerForm">Maximum Uploads Per Form</Label>
              <Input 
                id="maxUploadsPerForm" 
                type="number"
                value={securitySettings.maxUploadsPerForm.toString()} 
                onChange={(e) => setSecuritySettings({...securitySettings, maxUploadsPerForm: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
              <Input 
                id="allowedFileTypes" 
                value={securitySettings.allowedFileTypes} 
                onChange={(e) => setSecuritySettings({...securitySettings, allowedFileTypes: e.target.value})}
                placeholder=".pdf,.jpg,.png"
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated list of allowed file extensions
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
              <Input 
                id="maxFileSize" 
                type="number"
                value={securitySettings.maxFileSize.toString()} 
                onChange={(e) => setSecuritySettings({...securitySettings, maxFileSize: parseInt(e.target.value) || 0})}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSaveSettings('Security')}>Save Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure notification settings for form submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for new form submissions
                </p>
              </div>
              <Switch 
                checked={notificationSettings.emailNotifications} 
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email Address</Label>
              <Input 
                id="adminEmail" 
                type="email"
                value={notificationSettings.adminEmail} 
                onChange={(e) => setNotificationSettings({...notificationSettings, adminEmail: e.target.value})}
                placeholder="admin@example.com"
              />
              <p className="text-sm text-muted-foreground">
                Email address to receive notification emails
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emailTemplate">Email Template</Label>
              <Textarea 
                id="emailTemplate" 
                value={notificationSettings.emailTemplate} 
                onChange={(e) => setNotificationSettings({...notificationSettings, emailTemplate: e.target.value})}
                placeholder="New submission received for {{form_name}}..."
                rows={5}
              />
              <p className="text-sm text-muted-foreground">
                Template for notification emails. Use {'{'}{'{'}'form_name'{'}'}{'}'} or {'{'}{'{'}'submission_date'{'}'}{'}'} for dynamic content.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSaveSettings('Notification')}>Save Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="integrations">
        <Card>
          <CardHeader>
            <CardTitle>Integration Settings</CardTitle>
            <CardDescription>
              Configure how forms integrate with other systems and portals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Forms as Portal Widgets</Label>
                <p className="text-sm text-muted-foreground">
                  Allow forms to be added as widgets to homeowner and board portals
                </p>
              </div>
              <Switch 
                checked={integrationSettings.allowPortalWidget} 
                onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, allowPortalWidget: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultEndpointType">Default Endpoint Type</Label>
              <Select 
                value={integrationSettings.defaultEndpointType}
                onValueChange={(value) => setIntegrationSettings({...integrationSettings, defaultEndpointType: value})}
              >
                <SelectTrigger id="defaultEndpointType">
                  <SelectValue placeholder="Select endpoint type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="external">External URL</SelectItem>
                  <SelectItem value="internal">Internal Workflow</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="database">Database Storage Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How form data should be processed by default
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultEndpointUrl">Default External Endpoint URL</Label>
              <Input 
                id="defaultEndpointUrl" 
                value={integrationSettings.defaultEndpointUrl} 
                onChange={(e) => setIntegrationSettings({...integrationSettings, defaultEndpointUrl: e.target.value})}
                placeholder="https://example.com/api/form-submissions"
                disabled={integrationSettings.defaultEndpointType !== 'external'}
              />
              <p className="text-sm text-muted-foreground">
                External API endpoint to send form submissions (for external endpoint type)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultWorkflowType">Default Workflow Type</Label>
              <Select 
                value={integrationSettings.defaultWorkflowType}
                onValueChange={(value) => setIntegrationSettings({...integrationSettings, defaultWorkflowType: value})}
                disabled={integrationSettings.defaultEndpointType !== 'internal'}
              >
                <SelectTrigger id="defaultWorkflowType">
                  <SelectValue placeholder="Select workflow type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homeowner_request">Homeowner Request</SelectItem>
                  <SelectItem value="work_order">Work Order</SelectItem>
                  <SelectItem value="maintenance_request">Maintenance Request</SelectItem>
                  <SelectItem value="resale_order">Resale Order</SelectItem>
                  <SelectItem value="custom">Custom Workflow</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Internal workflow type for processing submissions (for internal workflow type)
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSaveSettings('Integration')}>Save Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
