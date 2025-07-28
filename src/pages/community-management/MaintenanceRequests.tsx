import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Wrench, Plus, Filter, Eye, MessageSquare, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TooltipButton from '@/components/ui/tooltip-button';

// Mock data for maintenance requests
const mockRequests = [
  {
    id: '1',
    requestNumber: 'MR-2025-001',
    propertyAddress: '123 Oak Street, Unit 204',
    requesterName: 'John Smith',
    category: 'Plumbing',
    priority: 'High',
    status: 'Open',
    description: 'Kitchen sink faucet leaking constantly',
    dateSubmitted: '2025-01-25',
    assignedTo: 'Mike\'s Plumbing',
    estimatedCost: 150,
    photos: 2
  },
  {
    id: '2',
    requestNumber: 'MR-2025-002',
    propertyAddress: '456 Pine Avenue, Unit 108',
    requesterName: 'Sarah Johnson',
    category: 'Electrical',
    priority: 'Medium',
    status: 'In Progress',
    description: 'Living room light switch not working',
    dateSubmitted: '2025-01-24',
    assignedTo: 'Electric Solutions',
    estimatedCost: 75,
    photos: 1
  },
  {
    id: '3',
    requestNumber: 'MR-2025-003',
    propertyAddress: '789 Maple Drive, Unit 312',
    requesterName: 'Mike Wilson',
    category: 'HVAC',
    priority: 'Low',
    status: 'Completed',
    description: 'Air conditioning not cooling properly',
    dateSubmitted: '2025-01-20',
    assignedTo: 'CoolAir Services',
    estimatedCost: 200,
    photos: 0
  },
  {
    id: '4',
    requestNumber: 'MR-2025-004',
    propertyAddress: '321 Elm Street, Unit 506',
    requesterName: 'Lisa Davis',
    category: 'General',
    priority: 'Medium',
    status: 'Pending Approval',
    description: 'Bathroom tile grout needs replacement',
    dateSubmitted: '2025-01-28',
    assignedTo: null,
    estimatedCost: 300,
    photos: 3
  }
];

const MaintenanceRequests = () => {
  const [requests] = useState(mockRequests);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending Approval':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-orange-100 text-orange-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate summary stats
  const totalRequests = requests.length;
  const openRequests = requests.filter(r => r.status === 'Open' || r.status === 'In Progress').length;
  const completedRequests = requests.filter(r => r.status === 'Completed').length;
  const avgCost = requests.reduce((sum, r) => sum + r.estimatedCost, 0) / requests.length;

  return (
    <AppLayout>
      <PageTemplate
        title="Maintenance Requests"
        icon={<Wrench className="h-8 w-8" />}
        description="Manage property maintenance requests and work orders."
        actions={
          <TooltipButton
            tooltip="Create a new maintenance request"
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Request
          </TooltipButton>
        }
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRequests}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Open/In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{openRequests}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedRequests}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(avgCost)}</div>
                <p className="text-xs text-muted-foreground">Per request</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Maintenance Requests</CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Pending Approval">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Est. Cost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono font-medium">{request.requestNumber}</TableCell>
                      <TableCell>
                        <div className="text-sm">{request.propertyAddress}</div>
                      </TableCell>
                      <TableCell>{request.requesterName}</TableCell>
                      <TableCell>{request.category}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.description}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.assignedTo || 'Unassigned'}</TableCell>
                      <TableCell>{formatCurrency(request.estimatedCost)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TooltipButton
                            tooltip="View details"
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="h-4 w-4" />
                          </TooltipButton>
                          <TooltipButton
                            tooltip="Add comment"
                            variant="ghost"
                            size="sm"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </TooltipButton>
                          {request.status !== 'Completed' && (
                            <TooltipButton
                              tooltip="Mark as completed"
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </TooltipButton>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default MaintenanceRequests;