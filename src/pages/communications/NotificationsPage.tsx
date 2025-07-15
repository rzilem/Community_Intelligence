import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Settings, Users, Mail, MessageSquare, Calendar, Plus, Edit, Trash2 } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Payment Due Reminder',
      type: 'payment',
      recipients: 'All Residents',
      status: 'active',
      lastSent: '2024-01-15',
      deliveryMethod: 'Email + SMS'
    },
    {
      id: '2',
      title: 'Maintenance Alert',
      type: 'maintenance',
      recipients: 'Building A',
      status: 'draft',
      lastSent: 'Never',
      deliveryMethod: 'Email'
    },
    {
      id: '3',
      title: 'Community Event',
      type: 'event',
      recipients: 'All Residents',
      status: 'scheduled',
      lastSent: '2024-01-10',
      deliveryMethod: 'Push + Email'
    }
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    autoReminders: true
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.inactive}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      payment: <Bell className="h-4 w-4" />,
      maintenance: <Settings className="h-4 w-4" />,
      event: <Calendar className="h-4 w-4" />,
      general: <MessageSquare className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || icons.general;
  };

  return (
    <AppLayout>
      <PageTemplate
        title="Notifications"
        icon={<Bell className="h-8 w-8" />}
        description="Manage automated notifications and alerts"
      >
        <div className="space-y-6">
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active Notifications</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Notification Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure automated notifications for residents
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Notification
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Notification</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Sent</TableHead>
                        <TableHead>Delivery</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(notification.type)}
                              <span className="font-medium">{notification.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{notification.type}</TableCell>
                          <TableCell>{notification.recipients}</TableCell>
                          <TableCell>{getStatusBadge(notification.status)}</TableCell>
                          <TableCell>{notification.lastSent}</TableCell>
                          <TableCell>{notification.deliveryMethod}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure global notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Send notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">SMS Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Send notifications via SMS
                        </p>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, smsNotifications: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Push Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Send push notifications to mobile apps
                        </p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, pushNotifications: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto Reminders</h4>
                        <p className="text-sm text-muted-foreground">
                          Automatically send payment and deadline reminders
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoReminders}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, autoReminders: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Emails Sent</p>
                        <p className="text-2xl font-bold">2,347</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">SMS Sent</p>
                        <p className="text-2xl font-bold">1,234</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Push Sent</p>
                        <p className="text-2xl font-bold">892</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Analytics</CardTitle>
                  <CardDescription>
                    Notification delivery and engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-8 text-center">
                      <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                      <p className="text-muted-foreground">
                        Detailed analytics and reporting coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default NotificationsPage;