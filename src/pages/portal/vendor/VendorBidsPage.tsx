
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, FileText, Filter, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { useAuth } from '@/contexts/auth';

const VendorBidsPage = () => {
  const { user, profile } = useAuth();
  
  const upcomingBids = [
    { 
      title: 'Pool Resurfacing Project', 
      dueDate: 'October 25, 2023', 
      association: 'Oakridge HOA',
      budget: '$15,000 - $20,000',
      status: 'Open'
    },
    { 
      title: 'Community Landscaping Contract', 
      dueDate: 'November 5, 2023', 
      association: 'Sunset Towers',
      budget: '$25,000 - $35,000',
      status: 'Open'
    },
    { 
      title: 'Clubhouse Renovation Project', 
      dueDate: 'November 15, 2023', 
      association: 'Pine Valley HOA',
      budget: '$50,000 - $75,000',
      status: 'Open'
    }
  ];

  return (
    <AppLayout>
      <div className="container p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Bids & Opportunities</h1>
            <p className="text-muted-foreground">
              View and respond to available bid opportunities
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="default">
              My Bids
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PortalNavigation portalType="vendor" />
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Bid Opportunities</CardTitle>
                <CardDescription>Projects currently open for bidding</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingBids.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBids.map((bid, index) => (
                      <div key={index} className="border rounded-md p-4 hover:border-primary transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{bid.title}</h3>
                            <p className="text-sm text-muted-foreground">{bid.association}</p>
                            <div className="grid grid-cols-2 gap-x-8 mt-2 text-sm">
                              <div>
                                <span className="font-medium">Due Date:</span> {bid.dueDate}
                              </div>
                              <div>
                                <span className="font-medium">Budget:</span> {bid.budget}
                              </div>
                            </div>
                          </div>
                          <Button>View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No bid opportunities available</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      There are currently no open bids available for your vendor category.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>My Submitted Bids</CardTitle>
                <CardDescription>Track the status of your bid submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No bids submitted yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You haven't submitted any bids yet. View available opportunities above.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default VendorBidsPage;
