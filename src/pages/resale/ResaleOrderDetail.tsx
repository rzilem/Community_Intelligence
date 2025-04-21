
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft, 
  Clock, 
  Home, 
  User, 
  Download, 
  CreditCard, 
  Calendar, 
  Check, 
  X, 
  Printer, 
  RefreshCw,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

// Mock data for a resale order (in a real implementation, this would come from API)
const getMockOrder = (id: string) => ({
  id,
  orderNumber: "RSL-2025-0042",
  type: "Resale Certificate",
  status: "processing",
  address: "123 Main Street, Apt 4B, Anytown, TX 75001",
  community: "Oakwood Heights HOA",
  property: {
    address: "123 Main Street",
    unit: "4B",
    city: "Anytown",
    state: "TX",
    zip: "75001",
    type: "Condominium"
  },
  contact: {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "(555) 123-4567",
    company: "ABC Title Company",
    role: "Title Company"
  },
  orderDetails: {
    rushOption: "Standard",
    closingDate: "2025-05-15",
    notes: "Please include parking information and recent board minutes.",
    price: 200,
    rushFee: 0,
    total: 200
  },
  payment: {
    status: "paid",
    date: "2025-04-15",
    method: "Credit Card ending in 4242",
    transactionId: "txn_4NJ28HKAL9"
  },
  timeline: [
    { date: "2025-04-15T14:32:00Z", event: "Order Placed", description: "Your order has been received." },
    { date: "2025-04-15T14:35:00Z", event: "Payment Processed", description: "Payment of $200.00 has been successfully processed." },
    { date: "2025-04-16T09:12:00Z", event: "Processing Started", description: "We've begun preparing your resale certificate." }
  ],
  documents: [
    { name: "Order Confirmation", status: "available", date: "2025-04-15" },
    { name: "Payment Receipt", status: "available", date: "2025-04-15" },
    { name: "Resale Certificate", status: "pending", estimatedDate: "2025-04-25" }
  ]
});

const ResaleOrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  
  useEffect(() => {
    if (orderId) {
      // Simulate API fetch
      setTimeout(() => {
        setOrder(getMockOrder(orderId));
        setLoading(false);
      }, 500);
    }
  }, [orderId]);
  
  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      toast({
        title: "Order Refreshed",
        description: "Your order information has been updated.",
      });
      setLoading(false);
    }, 1000);
  };
  
  const handleDownload = (documentName: string) => {
    toast({
      title: `Downloading ${documentName}`,
      description: "Your document is being prepared for download.",
    });
  };
  
  const handleAddComment = () => {
    if (commentText.trim()) {
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the order.",
      });
      setCommentText('');
    }
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
  
  if (loading) {
    return (
      <PageTemplate 
        title="Order Details"
        icon={<FileText className="h-8 w-8" />}
        description="Loading order information..."
      >
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      </PageTemplate>
    );
  }
  
  if (!order) {
    return (
      <PageTemplate 
        title="Order Not Found"
        icon={<FileText className="h-8 w-8" />}
        description="The requested order could not be found."
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <X className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Order Not Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We couldn't find an order with the provided ID. It may have been deleted or you might not have permission to view it.
              </p>
              <Button onClick={() => navigate('/resale-portal/my-orders')}>
                Return to My Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }
  
  return (
    <PageTemplate 
      title={`Order #${order.orderNumber}`}
      icon={<FileText className="h-8 w-8" />}
      description={`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`}
    >
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate('/resale-portal/my-orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    Order #{order.orderNumber}
                    {getStatusBadge(order.status)}
                  </CardTitle>
                  <CardDescription>{order.type} - {order.property.address}</CardDescription>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-medium">Estimated Completion:</div>
                  <div className="text-sm">April 25, 2025</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Property Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p>{order.property.address}, Unit {order.property.unit}, {order.property.city}, {order.property.state} {order.property.zip}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Property Type</p>
                          <p>{order.property.type}</p>
                        </div>
                        {order.community && (
                          <div>
                            <p className="text-sm text-muted-foreground">Community/HOA</p>
                            <p>{order.community}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Contact Name</p>
                          <p>{order.contact.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p>{order.contact.company}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p>{order.contact.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p>{order.contact.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Role</p>
                          <p>{order.contact.role}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Order Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Processing Option</p>
                          <p>{order.orderDetails.rushOption}</p>
                        </div>
                        {order.orderDetails.closingDate && (
                          <div>
                            <p className="text-sm text-muted-foreground">Closing Date</p>
                            <p>{order.orderDetails.closingDate}</p>
                          </div>
                        )}
                      </div>
                      
                      {order.orderDetails.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Additional Notes</p>
                          <p className="bg-muted p-3 rounded-md mt-1">{order.orderDetails.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Payment Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Status</p>
                          <Badge className="bg-green-500 mt-1">Paid</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Date</p>
                          <p>{order.payment.date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Method</p>
                          <p>{order.payment.method}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Transaction ID</p>
                          <p className="font-mono text-sm">{order.payment.transactionId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.documents.map((doc: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{doc.name}</TableCell>
                          <TableCell>
                            {doc.status === 'available' ? (
                              <Badge className="bg-green-500">Available</Badge>
                            ) : (
                              <Badge className="bg-yellow-500">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {doc.date || `Est. ${doc.estimatedDate}`}
                          </TableCell>
                          <TableCell className="text-right">
                            {doc.status === 'available' ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDownload(doc.name)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                <Clock className="h-4 w-4 mr-2" />
                                Pending
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-6 p-4 bg-muted rounded-md">
                    <h3 className="font-medium mb-2">Need Additional Documents?</h3>
                    <p className="text-sm mb-3">If you need additional documents or have special requirements, please contact our support team.</p>
                    <Button variant="secondary" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request Additional Documents
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="timeline">
                  <div className="space-y-4">
                    {order.timeline.map((event: any, index: number) => {
                      const date = new Date(event.date);
                      return (
                        <div key={index} className="flex gap-4">
                          <div className="w-12 flex-shrink-0 text-right text-sm text-muted-foreground">
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary after:absolute after:bottom-0 after:left-1 after:top-3 after:w-px after:bg-border">
                            <p className="font-medium">{event.event}</p>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="flex gap-4">
                      <div className="w-12 flex-shrink-0"></div>
                      <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-muted-foreground before:border-2 before:border-background">
                        <p className="font-medium">Estimated Completion</p>
                        <p className="text-sm text-muted-foreground">Your order is estimated to be completed by this date.</p>
                        <p className="text-xs text-muted-foreground mt-1">April 25, 2025</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="communication">
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="font-medium mb-2">Order Confirmation</h3>
                      <p className="text-sm mb-2">Your order has been received and is being processed. You will be notified when your documents are ready.</p>
                      <p className="text-xs text-muted-foreground">April 15, 2025 at 2:32 PM</p>
                    </div>
                    
                    <div className="bg-primary/10 p-4 rounded-md border-l-4 border-primary">
                      <h3 className="font-medium mb-2">System Notification</h3>
                      <p className="text-sm mb-2">Your payment of $200.00 has been successfully processed.</p>
                      <p className="text-xs text-muted-foreground">April 15, 2025 at 2:35 PM</p>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div>
                      <h3 className="font-medium mb-2">Add a Comment</h3>
                      <Textarea 
                        placeholder="Type your message here..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="mb-2"
                      />
                      <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                        Send Comment
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{order.type}</span>
                  <span>${order.orderDetails.price.toFixed(2)}</span>
                </div>
                
                {order.orderDetails.rushFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{order.orderDetails.rushOption} Processing</span>
                    <span>+${order.orderDetails.rushFee.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${order.orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="font-medium mb-2">Quick Info</h3>
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <Home className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>{order.property.address}, Unit {order.property.unit}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>{order.contact.name}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>Ordered: April 15, 2025</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>Processing: {order.orderDetails.rushOption}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>Payment: {order.payment.status === 'paid' ? 'Paid' : 'Pending'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2">
              <Button variant="secondary" className="w-full justify-between">
                <span>Download Receipt</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Contact Support</span>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">If you have any questions about this order or need assistance, our support team is here to help.</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email: support@example.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Phone: (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Hours: Mon-Fri, 9am-5pm CST</span>
                </div>
              </div>
              
              <div className="pt-2">
                <Button variant="link" className="p-0 h-auto text-sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View FAQs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
};

// Missing Phone icon
const Phone = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default ResaleOrderDetail;
