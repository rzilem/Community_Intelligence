import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Mail, MessageSquare, Bell, Eye, MousePointer, RefreshCw, Calendar } from 'lucide-react';

const TrackingPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');

  const campaigns = [
    {
      id: '1',
      name: 'Monthly Payment Reminder',
      type: 'email',
      sent: 245,
      delivered: 243,
      opened: 198,
      clicked: 45,
      bounced: 2,
      dateSent: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Maintenance Notice',
      type: 'sms',
      sent: 156,
      delivered: 154,
      opened: 154,
      clicked: 12,
      bounced: 2,
      dateSent: '2024-01-14',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Community Event',
      type: 'push',
      sent: 89,
      delivered: 87,
      opened: 62,
      clicked: 18,
      bounced: 2,
      dateSent: '2024-01-13',
      status: 'completed'
    }
  ];

  const deliveryData = [
    { name: 'Mon', emails: 45, sms: 23, push: 12 },
    { name: 'Tue', emails: 52, sms: 28, push: 15 },
    { name: 'Wed', emails: 48, sms: 25, push: 11 },
    { name: 'Thu', emails: 61, sms: 35, push: 18 },
    { name: 'Fri', emails: 55, sms: 30, push: 16 },
    { name: 'Sat', emails: 38, sms: 18, push: 9 },
    { name: 'Sun', emails: 42, sms: 20, push: 10 }
  ];

  const engagementData = [
    { name: 'Delivered', value: 484, color: '#10b981' },
    { name: 'Opened', value: 414, color: '#3b82f6' },
    { name: 'Clicked', value: 75, color: '#8b5cf6' },
    { name: 'Bounced', value: 6, color: '#ef4444' }
  ];

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      sending: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.completed}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      email: <Mail className="h-4 w-4" />,
      sms: <MessageSquare className="h-4 w-4" />,
      push: <Bell className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || icons.email;
  };

  const calculateRate = (numerator: number, denominator: number) => {
    if (denominator === 0) return '0%';
    return `${Math.round((numerator / denominator) * 100)}%`;
  };

  const totalStats = campaigns.reduce((acc, campaign) => ({
    sent: acc.sent + campaign.sent,
    delivered: acc.delivered + campaign.delivered,
    opened: acc.opened + campaign.opened,
    clicked: acc.clicked + campaign.clicked,
    bounced: acc.bounced + campaign.bounced
  }), { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 });

  return (
    <AppLayout>
      <PageTemplate
        title="Tracking & Analytics"
        icon={<Activity className="h-8 w-8" />}
        description="Monitor communication delivery and engagement metrics"
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-[300px]"
              />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Messages Sent</p>
                    <p className="text-2xl font-bold">{totalStats.sent.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Rate</p>
                    <p className="text-2xl font-bold">{calculateRate(totalStats.delivered, totalStats.sent)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Open Rate</p>
                    <p className="text-2xl font-bold">{calculateRate(totalStats.opened, totalStats.delivered)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Click Rate</p>
                    <p className="text-2xl font-bold">{calculateRate(totalStats.clicked, totalStats.opened)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="campaigns" className="space-y-4">
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="realtime">Real-time</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>
                    Track delivery and engagement metrics for all campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Delivered</TableHead>
                        <TableHead>Opened</TableHead>
                        <TableHead>Clicked</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(campaign.type)}
                              <span className="font-medium">{campaign.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{campaign.type}</TableCell>
                          <TableCell>{campaign.sent.toLocaleString()}</TableCell>
                          <TableCell>
                            {campaign.delivered.toLocaleString()}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({calculateRate(campaign.delivered, campaign.sent)})
                            </span>
                          </TableCell>
                          <TableCell>
                            {campaign.opened.toLocaleString()}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({calculateRate(campaign.opened, campaign.delivered)})
                            </span>
                          </TableCell>
                          <TableCell>
                            {campaign.clicked.toLocaleString()}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({calculateRate(campaign.clicked, campaign.opened)})
                            </span>
                          </TableCell>
                          <TableCell>{campaign.dateSent}</TableCell>
                          <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Delivery Trends</CardTitle>
                    <CardDescription>
                      Messages sent by channel over the last 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={deliveryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="emails" fill="#3b82f6" name="Emails" />
                        <Bar dataKey="sms" fill="#10b981" name="SMS" />
                        <Bar dataKey="push" fill="#8b5cf6" name="Push" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Overview</CardTitle>
                    <CardDescription>
                      Overall engagement metrics across all campaigns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={engagementData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {engagementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {engagementData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="realtime" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Activity</CardTitle>
                  <CardDescription>
                    Live tracking of message delivery and engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-8 text-center">
                      <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
                      <p className="text-muted-foreground">
                        Live activity monitoring coming soon
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

export default TrackingPage;