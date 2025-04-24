
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, FileCheck, Calendar, Clock } from 'lucide-react';
import { useResaleOrders } from '@/hooks/resale/useResaleOrders';

const ResaleOrderDetail = () => {
  const { orderId } = useParams();
  const { orders, isLoading } = useResaleOrders();
  
  const order = React.useMemo(() => {
    return orders.find(o => o.id === orderId);
  }, [orderId, orders]);
  
  if (isLoading) {
    return (
      <PageTemplate
        title="Order Details"
        icon={<FileText className="h-8 w-8" />}
        description="Loading order details..."
        backLink="/resale-portal/my-orders"
      >
        <div className="flex items-center justify-center p-8">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
        backLink="/resale-portal/my-orders"
      >
        <Card>
          <CardContent className="p-6">
            <div className="text-center p-4">
              <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground">The order you're looking for doesn't exist or you don't have access to it.</p>
              <Button className="mt-4" variant="outline" onClick={() => window.history.back()}>
                Go Back
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
      description={`${order.type} for ${order.address}`}
      backLink="/resale-portal/my-orders"
    >
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Order Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{order.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      order.status === 'In Review' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Scheduled' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <p className="font-medium">{order.priority}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Property & Dates</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{order.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Community</p>
                  <p className="font-medium">{order.community}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner/Seller</p>
                  <p className="font-medium">{order.ownerSeller}</p>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Scheduled for {new Date(order.scheduledDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Created on {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="documents">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Order Documents</h3>
              </div>
              
              <div className="rounded-md border p-4 bg-muted/30">
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <FileCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No Documents Available</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.status === 'Completed' 
                        ? "Documents will be available for download when processing is complete."
                        : "Documents will be uploaded here once your order is processed."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Order History</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Order created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Order scheduled</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.scheduledDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {order.status === 'Completed' && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                      <FileCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Order completed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Order Notes</h3>
              </div>
              
              <div className="rounded-md border p-4 bg-muted/30">
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No notes available</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      There are currently no notes for this order.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default ResaleOrderDetail;
