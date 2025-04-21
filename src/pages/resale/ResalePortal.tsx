
import React, { useState, useEffect } from 'react';
import { FileText, ArrowRight, Package, Clock, DollarSign, User, Settings, Search, Filter, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import { useResaleOrders } from '@/hooks/resale/useResaleOrders';

// Mock data for example orders
const mockOrders = [
  {
    id: "ord-1",
    orderNumber: "RSL-2025-0042",
    type: "Resale Certificate",
    address: "123 Main Street, Apt 4B, Anytown, TX 75001",
    submittedDate: "2025-04-15",
    estimatedCompletion: "2025-04-18",
    status: "processing",
    rushType: "Standard",
    price: "$200.00"
  },
  {
    id: "ord-2",
    orderNumber: "RSL-2025-0039",
    type: "Condo Questionnaire",
    address: "456 Oak Avenue, Unit 12, Anytown, TX 75001",
    submittedDate: "2025-04-12",
    estimatedCompletion: "2025-04-14",
    status: "completed",
    rushType: "Rush",
    price: "$225.00"
  }
];

const ResalePortal = () => {
  const [activeTab, setActiveTab] = useState('order');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // In a real implementation, we would use the useResaleOrders hook
  // const { orders, isLoading, error, refreshOrders } = useResaleOrders();
  const orders = mockOrders;
  const isLoading = false;
  
  const orderTypes = [
    {
      id: 'resale-cert',
      title: 'Resale Certificate',
      description: 'Required for property sale transactions',
      price: '$200',
      turnaround: '10 business days',
      rushOptions: [
        { name: 'Standard', time: '10 business days', price: '+$0' },
        { name: 'Rush', time: '3-5 business days', price: '+$50' },
        { name: 'Super Rush', time: '1-2 business days', price: '+$100' },
        { name: 'Same Day', time: 'Same business day (by 5pm if ordered before 11am)', price: '+$150' }
      ]
    },
    {
      id: 'condo-quest',
      title: 'Condo Questionnaire',
      description: 'Standard condo questionnaire for lenders',
      price: '$150',
      turnaround: '7 business days',
      rushOptions: [
        { name: 'Standard', time: '7 business days', price: '+$0' },
        { name: 'Rush', time: '2-4 business days', price: '+$50' },
        { name: 'Super Rush', time: '24 hours', price: '+$75' }
      ]
    },
    {
      id: 'mortgage-quest',
      title: 'Mortgage Questionnaire',
      description: 'Detailed information for mortgage lenders',
      price: '$125',
      turnaround: '5 business days',
      rushOptions: [
        { name: 'Standard', time: '5 business days', price: '+$0' },
        { name: 'Rush', time: '2-3 business days', price: '+$40' },
        { name: 'Super Rush', time: '24 hours', price: '+$60' }
      ]
    },
    {
      id: 'disclosure-packet',
      title: 'Disclosure Packet',
      description: 'Required HOA disclosure documents',
      price: '$175',
      turnaround: '7 business days',
      rushOptions: [
        { name: 'Standard', time: '7 business days', price: '+$0' },
        { name: 'Rush', time: '3 business days', price: '+$50' },
        { name: 'Super Rush', time: '24 hours', price: '+$75' }
      ]
    }
  ];

  const handleOrderStart = (orderTypeId: string) => {
    navigate(`/resale-portal/order?type=${orderTypeId}`);
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/resale-portal/orders/${orderId}`);
  };

  const handleNavigateToSettings = () => {
    navigate('/resale-portal/settings');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-blue-500">Pending</Badge>;
      case 'canceled':
        return <Badge className="bg-red-500">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <PageTemplate 
      title="Resale Document Portal" 
      icon={<FileText className="h-8 w-8" />}
      description="Order, track, and manage resale documents and information requests."
    >
      <div className="flex justify-between items-center mb-6">
        {user && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNavigateToSettings}>
              <User className="w-4 h-4 mr-2" />
              Account Settings
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/resale-portal/my-orders')}>
              <Package className="w-4 h-4 mr-2" />
              My Orders
            </Button>
          </div>
        )}
        <div>
          {!user ? (
            <Button>
              Sign In
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Logged in as {user.email}</p>
          )}
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="mt-6"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="order">Order Documents</TabsTrigger>
          <TabsTrigger value="my-orders">My Orders</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="order">
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Select Document Type</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {orderTypes.map(orderType => (
                <Card key={orderType.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle>{orderType.title}</CardTitle>
                    <CardDescription>{orderType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Starting at {orderType.price}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Standard turnaround: {orderType.turnaround}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="border-t p-4 mt-2">
                    <Button 
                      className="w-full"
                      onClick={() => handleOrderStart(orderType.id)}
                    >
                      Order Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Rush Options Available</CardTitle>
                <CardDescription>Need your documents faster? Select a rush option during checkout.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium">Standard</h3>
                    <p className="text-sm text-muted-foreground">Regular processing time</p>
                    <p className="font-bold mt-2">Base Price</p>
                  </div>
                  <div className="border rounded-md p-4 bg-blue-50 dark:bg-blue-950/20">
                    <h3 className="font-medium">Rush</h3>
                    <p className="text-sm text-muted-foreground">3-5 business days</p>
                    <p className="font-bold mt-2">+$50</p>
                  </div>
                  <div className="border rounded-md p-4 bg-orange-50 dark:bg-orange-950/20">
                    <h3 className="font-medium">Super Rush</h3>
                    <p className="text-sm text-muted-foreground">1-2 business days</p>
                    <p className="font-bold mt-2">+$100</p>
                  </div>
                  <div className="border rounded-md p-4 bg-red-50 dark:bg-red-950/20">
                    <h3 className="font-medium">Same Day</h3>
                    <p className="text-sm text-muted-foreground">Same business day (if ordered before 11am)</p>
                    <p className="font-bold mt-2">+$150</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Rush fees vary by document type. Exact pricing will be shown during checkout.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="my-orders">
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>
                Track the status of your document orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        placeholder="Search orders by address, order number..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Date Range
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="py-4 text-center">
                      <p>Loading your orders...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="hidden md:table-cell">Address</TableHead>
                            <TableHead className="hidden md:table-cell">Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map(order => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.orderNumber}</TableCell>
                              <TableCell>{order.type}</TableCell>
                              <TableCell className="hidden md:table-cell max-w-[200px] truncate">{order.address}</TableCell>
                              <TableCell className="hidden md:table-cell">{order.submittedDate}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewOrder(order.id)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You haven't placed any orders yet
                      </p>
                      <Button onClick={() => setActiveTab('order')}>Order Documents</Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Login to View Orders</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Login to view your order history and track order status
                  </p>
                  <Button>Login to View Orders</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>Ordering Instructions</CardTitle>
              <CardDescription>
                Learn how to order and receive documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Ordering Process</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Select the document type you need from the "Order Documents" tab</li>
                  <li>Complete the property information form</li>
                  <li>Choose standard or rush processing</li>
                  <li>Complete payment</li>
                  <li>Receive confirmation email with order details</li>
                  <li>Track order status in "My Orders"</li>
                  <li>Download completed documents when ready</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Processing Times</h3>
                <p className="mb-2">Processing times are in business days (Monday-Friday, excluding holidays):</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="font-medium">Standard:</span> Varies by document (5-10 business days)</li>
                  <li><span className="font-medium">Rush:</span> 2-5 business days</li>
                  <li><span className="font-medium">Super Rush:</span> 1-2 business days</li>
                  <li><span className="font-medium">Same Day:</span> Same business day (if ordered before 11am)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Payment Methods</h3>
                <p>We accept all major credit cards. Payment is required at the time of order.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Questions?</h3>
                <p>Contact our support team at <a href="mailto:support@example.com" className="text-primary underline">support@example.com</a></p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default ResalePortal;
