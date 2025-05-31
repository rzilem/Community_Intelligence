
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Send, Bell, Settings, Zap, Users } from 'lucide-react';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { format } from 'date-fns';

const NotificationCenter: React.FC = () => {
  const {
    isLoading,
    templates,
    queue,
    createTemplate,
    sendNotification,
    fetchTemplates,
    fetchQueue,
    createAutomatedWorkflow
  } = useNotifications();

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'email' as const,
    category: 'announcement' as const,
    subject_template: '',
    body_template: '',
    variables: [] as string[]
  });

  useEffect(() => {
    fetchTemplates();
    fetchQueue();
  }, [fetchTemplates, fetchQueue]);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTemplate({
        ...newTemplate,
        association_id: 'demo-association-id' // This would come from context
      });
      
      // Reset form
      setNewTemplate({
        name: '',
        type: 'email',
        category: 'announcement',
        subject_template: '',
        body_template: '',
        variables: []
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSendBulkNotification = async (templateId: string) => {
    try {
      // Demo: Send to all residents
      const mockRecipients = [
        { id: 'resident-1', type: 'resident' as const },
        { id: 'resident-2', type: 'resident' as const },
        { id: 'resident-3', type: 'resident' as const }
      ];

      for (const recipient of mockRecipients) {
        await sendNotification(
          templateId,
          recipient.id,
          recipient.type,
          {
            firstName: 'Resident',
            propertyAddress: '123 Main St',
            dueDate: '2024-02-15'
          }
        );
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  const templateTypes = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push Notification' },
    { value: 'in_app', label: 'In-App' }
  ];

  const templateCategories = [
    { value: 'payment_reminder', label: 'Payment Reminder' },
    { value: 'violation_notice', label: 'Violation Notice' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'booking_confirmation', label: 'Booking Confirmation' },
    { value: 'system_alert', label: 'System Alert' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500';
      case 'queued': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'delivered': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="queue">Queue</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Notification Templates</h3>
                <Button size="sm" variant="outline" onClick={() => fetchTemplates()}>
                  Refresh
                </Button>
              </div>

              {templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No templates created yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <div className="flex gap-1">
                            <Badge variant="outline">{template.type}</Badge>
                            <Badge variant="secondary">{template.category}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="font-medium text-sm">Subject:</p>
                          <p className="text-sm text-muted-foreground">{template.subject_template}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-sm">Variables:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleSendBulkNotification(template.id)}
                            disabled={isLoading}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Send Bulk
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTemplate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                          placeholder="Enter template name..."
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="template-type">Type</Label>
                        <Select
                          value={newTemplate.type}
                          onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {templateTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-category">Category</Label>
                      <Select
                        value={newTemplate.category}
                        onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templateCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-subject">Subject Template</Label>
                      <Input
                        id="template-subject"
                        value={newTemplate.subject_template}
                        onChange={(e) => setNewTemplate({ ...newTemplate, subject_template: e.target.value })}
                        placeholder="Subject with {{variables}}"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-body">Body Template</Label>
                      <Textarea
                        id="template-body"
                        value={newTemplate.body_template}
                        onChange={(e) => setNewTemplate({ ...newTemplate, body_template: e.target.value })}
                        placeholder="Message body with {{variables}}"
                        rows={6}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Available Variables</Label>
                      <div className="flex flex-wrap gap-2">
                        {['firstName', 'lastName', 'propertyAddress', 'dueDate', 'amount'].map((variable) => (
                          <Badge key={variable} variant="outline" className="cursor-pointer">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      <Plus className="h-4 w-4 mr-1" />
                      Create Template
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="queue" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Notification Queue</h3>
                <Button size="sm" variant="outline" onClick={() => fetchQueue()}>
                  Refresh
                </Button>
              </div>

              {queue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications in queue</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((notification) => (
                    <Card key={notification.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">
                              {(notification as any).notification_templates?.name || 'Unknown Template'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              To: {notification.recipient_type} ({notification.recipient_id})
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(notification.status)} text-white`}>
                            {notification.status}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Created: {format(new Date(notification.created_at), 'MMM d, HH:mm')}</span>
                          {notification.sent_at && (
                            <span>Sent: {format(new Date(notification.sent_at), 'MMM d, HH:mm')}</span>
                          )}
                        </div>
                        
                        {notification.error_message && (
                          <p className="text-xs text-red-600 mt-1">{notification.error_message}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Automated Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <h3 className="font-semibold mb-1">Payment Reminders</h3>
                        <p className="text-sm text-muted-foreground">
                          Automatically remind residents about upcoming payments
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <h3 className="font-semibold mb-1">Welcome Series</h3>
                        <p className="text-sm text-muted-foreground">
                          Send welcome messages to new residents
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <Settings className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <h3 className="font-semibold mb-1">Maintenance Alerts</h3>
                        <p className="text-sm text-muted-foreground">
                          Notify about scheduled maintenance activities
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <h3 className="font-semibold mb-1">Custom Workflow</h3>
                        <p className="text-sm text-muted-foreground">
                          Create your own automated workflow
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div className="text-center">
                    <h4 className="font-semibold mb-2">AI-Powered Optimization</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our AI automatically optimizes send times, message content, and delivery channels 
                      for maximum engagement based on recipient behavior patterns.
                    </p>
                    <Button variant="outline">
                      <Zap className="h-4 w-4 mr-1" />
                      View AI Insights
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
