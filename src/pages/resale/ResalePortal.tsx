
import React, { useState } from 'react';
import { FileText, ArrowRight, Package, Clock, DollarSign } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth';

const ResalePortal = () => {
  const [activeTab, setActiveTab] = useState('order');
  const { user } = useAuth();
  
  const orderTypes = [
    {
      id: 'resale-cert',
      title: 'Resale Certificate',
      description: 'Required for property sale transactions',
      price: '$200',
      turnaround: '3-5 business days'
    },
    {
      id: 'condo-quest',
      title: 'Condo Questionnaire',
      description: 'Standard condo questionnaire for lenders',
      price: '$150',
      turnaround: '2-4 business days'
    },
    {
      id: 'mortgage-quest',
      title: 'Mortgage Questionnaire',
      description: 'Detailed information for mortgage lenders',
      price: '$125',
      turnaround: '2-3 business days'
    }
  ];

  return (
    <PageTemplate 
      title="Resale Document Portal" 
      icon={<FileText className="h-8 w-8" />}
      description="Order, track, and manage resale documents and information requests."
    >
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
              {user ? (
                <p className="text-sm text-muted-foreground">Logged in as {user.email}</p>
              ) : (
                <Button variant="outline">Login for faster checkout</Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
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
                        <span className="text-sm">{orderType.price}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{orderType.turnaround}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="border-t p-4 mt-2">
                    <Button className="w-full">
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
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium">Standard</h3>
                  <p className="text-sm text-muted-foreground">3-5 business days</p>
                  <p className="font-bold mt-2">Base Price</p>
                </div>
                <div className="border rounded-md p-4 bg-orange-50 dark:bg-orange-950/20">
                  <h3 className="font-medium">Rush</h3>
                  <p className="text-sm text-muted-foreground">1-2 business days</p>
                  <p className="font-bold mt-2">+$50</p>
                </div>
                <div className="border rounded-md p-4 bg-red-50 dark:bg-red-950/20">
                  <h3 className="font-medium">Super Rush</h3>
                  <p className="text-sm text-muted-foreground">Same business day (if ordered before 11am)</p>
                  <p className="font-bold mt-2">+$100</p>
                </div>
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
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Order #RSL-2025-0042</h3>
                        <p className="text-sm text-muted-foreground">Resale Certificate</p>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Processing</span>
                      </div>
                    </div>
                    <div className="mt-4 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span>Ordered on:</span>
                        <span>Apr 15, 2025</span>
                      </div>
                      <div className="flex justify-between border-b py-2">
                        <span>Estimated completion:</span>
                        <span>Apr 18, 2025</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span>Rush option:</span>
                        <span>Standard</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
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
                  <li><span className="font-medium">Standard:</span> 3-5 business days</li>
                  <li><span className="font-medium">Rush:</span> 1-2 business days</li>
                  <li><span className="font-medium">Super Rush:</span> Same business day (if ordered before 11am)</li>
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
