
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Plus } from 'lucide-react';
import HomeownerRequestsTable from '@/components/homeowners/HomeownerRequestsTable';
import HomeownerRequestFilters from '@/components/homeowners/HomeownerRequestFilters';
import { HomeownerRequest, HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';

const mockHomeownerRequests: HomeownerRequest[] = [
  {
    id: '1',
    title: 'Leaking Roof in Unit 2A',
    description: 'Water is dripping from the ceiling after recent rain',
    status: 'open',
    priority: 'high',
    type: 'maintenance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    residentId: 'resident1',
    propertyId: 'property1',
    associationId: 'association1'
  },
  {
    id: '2',
    title: 'Parking Space Violation',
    description: 'Unauthorized vehicle parked in assigned spot',
    status: 'in-progress',
    priority: 'medium',
    type: 'compliance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    residentId: 'resident2',
    propertyId: 'property2',
    associationId: 'association1'
  }
];

const HomeownerRequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<HomeownerRequestStatus | 'all'>('all');
  const [priority, setPriority] = useState<HomeownerRequestPriority | 'all'>('all');
  const [type, setType] = useState<HomeownerRequestType | 'all'>('all');

  const filteredRequests = mockHomeownerRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = status === 'all' || request.status === status;
    const matchesPriority = priority === 'all' || request.priority === priority;
    const matchesType = type === 'all' || request.type === type;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Homeowner Requests</h1>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Request
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <HomeownerRequestFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              status={status}
              setStatus={setStatus}
              priority={priority}
              setPriority={setPriority}
              type={type}
              setType={setType}
            />
            
            <HomeownerRequestsTable requests={filteredRequests} />
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredRequests.length} of {mockHomeownerRequests.length} requests
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HomeownerRequestsPage;
