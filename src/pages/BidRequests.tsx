
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, FileText } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';

const BidRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for bid requests
  const bidRequests = [
    {
      id: '1',
      title: 'Pool Maintenance Service',
      description: 'Annual pool cleaning and maintenance contract',
      category: 'Pool Maintenance',
      status: 'open',
      budget: '$5,000 - $8,000',
      deadline: '2024-02-15',
      bidsReceived: 3
    },
    {
      id: '2',
      title: 'Landscape Renovation',
      description: 'Front entrance landscaping renovation project',
      category: 'Landscaping',
      status: 'under_review',
      budget: '$15,000 - $20,000',
      deadline: '2024-02-10',
      bidsReceived: 5
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'awarded': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = bidRequests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTemplate
      title="Bid Requests"
      icon={<FileText className="h-8 w-8" />}
      description="Manage vendor bid requests and procurement"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search bid requests..."
                className="pl-10 w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Bid Request
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bid Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bids</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.title}</div>
                        <div className="text-sm text-muted-foreground">{request.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{request.category}</TableCell>
                    <TableCell>{request.budget}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.bidsReceived}</TableCell>
                    <TableCell>{request.deadline}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default BidRequests;
