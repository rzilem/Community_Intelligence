import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Clock, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTemplate from '@/components/layout/PageTemplate';
import { useAuth } from '@/contexts/auth';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreDropdown } from '@/components/ui/MoreDropdown';

const BidRequests = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const bidRequests = [
    {
      id: '1',
      title: 'Landscaping Services',
      association: 'Sunset HOA',
      dateRequested: '2024-07-15',
      dueDate: '2024-06-30',
      status: 'pending',
      bidsReceived: 3,
      budget: 5000,
      residentsInvolved: 5,
    },
    {
      id: '2',
      title: 'Roof Repair',
      association: 'Sunrise HOA',
      dateRequested: '2024-07-10',
      dueDate: '2024-06-25',
      status: 'approved',
      bidsReceived: 5,
      budget: 10000,
      residentsInvolved: 10,
    },
    {
      id: '3',
      title: 'Pool Maintenance',
      association: 'Oceanview HOA',
      dateRequested: '2024-07-05',
      dueDate: '2024-06-20',
      status: 'completed',
      bidsReceived: 4,
      budget: 2000,
      residentsInvolved: 2,
    },
  ];

  const filteredBidRequests = bidRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageTemplate
      title="Bid Requests"
      icon={<DollarSign className="h-8 w-8" />}
      description="Manage and track all bid requests for community projects"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Community Bid Requests</CardTitle>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Bid Request
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="col-span-2">
              <Input
                type="text"
                placeholder="Search bid requests..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="md:w-full"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
          <ScrollArea>
            <div className="relative max-w-[1400px] overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Title</TableHead>
                    <TableHead>Association</TableHead>
                    <TableHead>Date Requested</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-center">Bids</TableHead>
                    <TableHead className="text-center">Residents</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBidRequests.map(request => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell>{request.association}</TableCell>
                      <TableCell>{request.dateRequested}</TableCell>
                      <TableCell>{request.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'success' : 'default'}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">${request.budget}</TableCell>
                      <TableCell className="text-center">{request.bidsReceived}</TableCell>
                      <TableCell className="text-center">{request.residentsInvolved}</TableCell>
                      <TableCell className="text-right">
                        <MoreDropdown>
                          <a className="dropdown-item" href="#">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </a>
                          <a className="dropdown-item" href="#">
                            <Edit className="mr-2 h-4 w-4" /> Edit Request
                          </a>
                          <a className="dropdown-item" href="#">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </a>
                        </MoreDropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default BidRequests;
