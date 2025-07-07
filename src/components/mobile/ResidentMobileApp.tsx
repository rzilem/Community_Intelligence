import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Home,
  Wrench,
  CreditCard,
  Bell,
  Calendar,
  MessageSquare,
  Camera,
  Package,
  AlertCircle,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  FileText
} from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  createdAt: string;
  description: string;
  photos?: string[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'general' | 'maintenance' | 'event' | 'emergency';
  urgent: boolean;
}

const ResidentMobileApp: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestDescription, setNewRequestDescription] = useState('');
  const [requestPriority, setRequestPriority] = useState<'low' | 'medium' | 'high' | 'emergency'>('medium');

  // Mock data
  const [requests, setRequests] = useState<MaintenanceRequest[]>([
    {
      id: '1',
      title: 'Kitchen Faucet Leak',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2024-01-15',
      description: 'The kitchen faucet has been dripping for several days.'
    },
    {
      id: '2',
      title: 'AC Not Working',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-14',
      description: 'Air conditioning unit stopped working yesterday evening.'
    }
  ]);

  const [announcements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Pool Maintenance Scheduled',
      content: 'The community pool will be closed for maintenance from Jan 20-22.',
      date: '2024-01-15',
      category: 'maintenance',
      urgent: false
    },
    {
      id: '2',
      title: 'Emergency: Water Shut-off',
      content: 'Water will be shut off in Building A from 9 AM to 2 PM today for repairs.',
      date: '2024-01-15',
      category: 'emergency',
      urgent: true
    }
  ]);

  const [packageDeliveries] = useState([
    { id: '1', carrier: 'Amazon', status: 'Ready for pickup', date: '2024-01-15' },
    { id: '2', carrier: 'FedEx', status: 'Delivered', date: '2024-01-14' }
  ]);

  const [accountBalance] = useState({
    currentBalance: 0,
    nextPaymentDue: '2024-02-01',
    nextPaymentAmount: 450.00
  });

  const submitMaintenanceRequest = () => {
    if (!newRequestTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your request.",
        variant: "destructive"
      });
      return;
    }

    const newRequest: MaintenanceRequest = {
      id: Date.now().toString(),
      title: newRequestTitle,
      status: 'pending',
      priority: requestPriority,
      createdAt: new Date().toISOString().split('T')[0],
      description: newRequestDescription
    };

    setRequests(prev => [newRequest, ...prev]);
    setNewRequestTitle('');
    setNewRequestDescription('');
    setRequestPriority('medium');

    toast({
      title: "Request Submitted",
      description: "Your maintenance request has been submitted successfully."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Resident Portal</h1>
            <p className="text-sm opacity-90">Unit 4B - Oakwood Commons</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">3</Badge>
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger value="dashboard" className="flex-col py-1">
              <Home className="h-4 w-4" />
              <span className="text-xs">Home</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex-col py-1">
              <Wrench className="h-4 w-4" />
              <span className="text-xs">Service</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex-col py-1">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">Pay</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex-col py-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Community</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex-col py-1">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">Messages</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="p-4 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">${accountBalance.currentBalance}</div>
                  <div className="text-sm text-muted-foreground">Current Balance</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{packageDeliveries.length}</div>
                  <div className="text-sm text-muted-foreground">Packages</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Maintenance Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Recent Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requests.slice(0, 3).map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{request.title}</div>
                        <div className="text-sm text-muted-foreground">{request.createdAt}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Urgent Announcements */}
            {announcements.filter(a => a.urgent).length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-5 w-5" />
                    Urgent Notices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {announcements.filter(a => a.urgent).map(announcement => (
                    <div key={announcement.id} className="p-3 bg-white rounded-lg">
                      <div className="font-medium text-orange-800">{announcement.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{announcement.content}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Package Deliveries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Package Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {packageDeliveries.map(pkg => (
                    <div key={pkg.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{pkg.carrier}</div>
                        <div className="text-sm text-muted-foreground">{pkg.date}</div>
                      </div>
                      <Badge variant={pkg.status === 'Ready for pickup' ? 'default' : 'secondary'}>
                        {pkg.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="p-4 space-y-4">
            {/* New Request Form */}
            <Card>
              <CardHeader>
                <CardTitle>Submit New Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Request Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={newRequestTitle}
                    onChange={(e) => setNewRequestTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the issue"
                    value={newRequestDescription}
                    onChange={(e) => setNewRequestDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={requestPriority === 'low' ? 'default' : 'outline'}
                    onClick={() => setRequestPriority('low')}
                    size="sm"
                  >
                    Low
                  </Button>
                  <Button
                    variant={requestPriority === 'medium' ? 'default' : 'outline'}
                    onClick={() => setRequestPriority('medium')}
                    size="sm"
                  >
                    Medium
                  </Button>
                  <Button
                    variant={requestPriority === 'high' ? 'default' : 'outline'}
                    onClick={() => setRequestPriority('high')}
                    size="sm"
                  >
                    High
                  </Button>
                  <Button
                    variant={requestPriority === 'emergency' ? 'destructive' : 'outline'}
                    onClick={() => setRequestPriority('emergency')}
                    size="sm"
                  >
                    Emergency
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Add Photos
                  </Button>
                  <Button onClick={submitMaintenanceRequest} className="flex-1">
                    Submit Request
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Request History */}
            <Card>
              <CardHeader>
                <CardTitle>Your Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requests.map(request => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{request.title}</div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status === 'in-progress' ? 'In Progress' : request.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{request.description}</div>
                      <div className="text-xs text-muted-foreground">Submitted: {request.createdAt}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">${accountBalance.currentBalance}</div>
                  <div className="text-muted-foreground">Current Balance</div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Next Payment Due:</span>
                    <span className="font-medium">{accountBalance.nextPaymentDue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Amount Due:</span>
                    <span className="font-medium">${accountBalance.nextPaymentAmount}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Mock payment history */}
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">Monthly Assessment</div>
                      <div className="text-sm text-muted-foreground">Dec 2023</div>
                    </div>
                    <div className="text-green-600 font-medium">$450.00</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">Monthly Assessment</div>
                      <div className="text-sm text-muted-foreground">Nov 2023</div>
                    </div>
                    <div className="text-green-600 font-medium">$450.00</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Community Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className={`p-4 rounded-lg border ${announcement.urgent ? 'border-orange-200 bg-orange-50' : 'bg-muted'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{announcement.title}</div>
                        <Badge variant={announcement.urgent ? 'destructive' : 'secondary'}>
                          {announcement.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{announcement.content}</div>
                      <div className="text-xs text-muted-foreground">{announcement.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">HOA Board Meeting</div>
                    <div className="text-sm text-muted-foreground">January 25, 2024 - 7:00 PM</div>
                    <div className="text-sm text-muted-foreground">Community Center</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Pool Party</div>
                    <div className="text-sm text-muted-foreground">February 3, 2024 - 2:00 PM</div>
                    <div className="text-sm text-muted-foreground">Community Pool</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Property Manager</div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Your maintenance request has been assigned to our technician.</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">HOA Board</div>
                      <div className="text-xs text-muted-foreground">1 day ago</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Monthly assessment payment confirmation received.</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Management
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResidentMobileApp;