
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { 
  ListOrdered, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle, 
  Calendar, 
  SlidersHorizontal, 
  ArrowDownUp, 
  Eye, 
  FileEdit, 
  Download
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Types for order queue entries
interface OrderQueueEntry {
  id: string;
  orderNumber: string;
  address: string;
  ownerSeller: string;
  community: string;
  type: string;
  priority: 'Urgent' | 'Regular' | 'Standard' | 'Expedited';
  scheduledDate: string;
  status: 'Scheduled' | 'Completed' | 'In Review' | 'Past Due';
}

const OrderQueue = () => {
  // Sample data for order queue
  const orderQueueData: OrderQueueEntry[] = [
    {
      id: '1',
      orderNumber: 'MOH-402879',
      address: '4508 Duval Road Unit 1-101, Austin, TX 78759',
      ownerSeller: 'Rebecca Johnson',
      community: 'Stonehaven Condos',
      type: 'Mortgage Questionnaire',
      priority: 'Regular',
      scheduledDate: '04/01/25',
      status: 'Scheduled'
    },
    {
      id: '2',
      orderNumber: 'MOH-402855',
      address: '175 Caspian Ln, Driftwood, TX 78619',
      ownerSeller: 'Viktor & Maria Cizmarik',
      community: 'La Ventana Ranch',
      type: 'Resale Certificate',
      priority: 'Standard',
      scheduledDate: '04/01/25',
      status: 'Scheduled'
    },
    {
      id: '3',
      orderNumber: 'MOH-402899',
      address: '107 Sunrise Ridge Cv Unit 1603, Austin, TX 78738',
      ownerSeller: 'James Wilson',
      community: 'Enclave at Alta Vista',
      type: 'Questionnaire',
      priority: 'Expedited',
      scheduledDate: '04/01/25',
      status: 'In Review'
    },
    {
      id: '4',
      orderNumber: 'MOH-402881',
      address: '206 Newport Landing Pl, Round Rock, TX 78664',
      ownerSeller: 'Kathleen Moore',
      community: 'Chandler Creek HOA',
      type: 'Resale Certificate',
      priority: 'Regular',
      scheduledDate: '04/01/25',
      status: 'Completed'
    },
    {
      id: '5',
      orderNumber: 'MOH-402851',
      address: '5704 Menchaca Rd Unit 21, Austin, TX 78745',
      ownerSeller: 'Bette Williams',
      community: 'Towne Court',
      type: 'Resale Certificate',
      priority: 'Urgent',
      scheduledDate: '04/01/25',
      status: 'Scheduled'
    },
    {
      id: '6',
      orderNumber: 'MOH-402500',
      address: '107 Sunrise Ridge Cv Unit 1603, Austin, TX 78738',
      ownerSeller: 'James Wilson',
      community: 'Enclave at Alta Vista',
      type: 'Compliance Questionnaire',
      priority: 'Expedited',
      scheduledDate: '04/02/25',
      status: 'Past Due'
    }
  ];

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [activeTab, setActiveTab] = useState('all');

  // Filter the data based on the current filters and search term
  const filteredData = orderQueueData.filter(order => {
    // Search term filtering
    if (searchTerm && !Object.values(order).some(value => 
      typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return false;
    }
    
    // Status filtering
    if (statusFilter !== 'All Statuses' && order.status !== statusFilter) {
      return false;
    }
    
    // Priority filtering
    if (priorityFilter !== 'All Priorities' && order.priority !== priorityFilter) {
      return false;
    }
    
    // Type filtering
    if (typeFilter !== 'All Types' && order.type !== typeFilter) {
      return false;
    }
    
    // Tab filtering
    if (activeTab === 'scheduled' && order.status !== 'Scheduled') {
      return false;
    } else if (activeTab === 'in-progress' && order.status !== 'In Review') {
      return false;
    } else if (activeTab === 'completed' && order.status !== 'Completed') {
      return false;
    } else if (activeTab === 'past-due' && order.status !== 'Past Due') {
      return false;
    }
    
    return true;
  });

  // Get unique values for filters
  const statusOptions = ['All Statuses', ...new Set(orderQueueData.map(order => order.status))];
  const priorityOptions = ['All Priorities', ...new Set(orderQueueData.map(order => order.priority))];
  const typeOptions = ['All Types', ...new Set(orderQueueData.map(order => order.type))];

  // Helper function to render status badges with appropriate colors
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge className="bg-amber-500">Scheduled</Badge>;
      case 'Completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'In Review':
        return <Badge className="bg-blue-500">In Review</Badge>;
      case 'Past Due':
        return <Badge className="bg-red-500">Past Due</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Helper function to render priority badges with appropriate colors
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <Badge className="bg-red-500">Urgent</Badge>;
      case 'Expedited':
        return <Badge className="bg-purple-500">Expedited</Badge>;
      case 'Regular':
        return <Badge className="bg-gray-500">Regular</Badge>;
      case 'Standard':
        return <Badge className="bg-gray-500">Standard</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <PageTemplate 
      title="Resale Management" 
      icon={<ListOrdered className="h-8 w-8" />}
      description="Process and manage property resale documentation"
    >
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Process and manage property resale documentation</p>
        <Button className="gap-2">
          <span>+</span> New Resale Request
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Resale Documentation Center</h2>
            <p className="text-gray-500">Manage all resale-related documentation and processes</p>
          </div>

          <Tabs defaultValue="overview" className="w-full mb-6">
            <TabsList className="w-full grid grid-cols-3 md:grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Certificates</span>
              </TabsTrigger>
              <TabsTrigger value="questionnaires" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Questionnaires</span>
              </TabsTrigger>
              <TabsTrigger value="inspections" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Inspections</span>
              </TabsTrigger>
              <TabsTrigger value="statements" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Statements</span>
              </TabsTrigger>
              <TabsTrigger value="trec-forms" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>TREC Forms</span>
              </TabsTrigger>
              <TabsTrigger value="order-queue" className="flex items-center gap-1">
                <ListOrdered className="h-4 w-4" />
                <span>Order Queue</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {/* Filter tabs */}
            <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
              <TabsList className="inline-flex h-10 items-center justify-start p-1 bg-muted text-muted-foreground rounded-md w-full md:w-auto">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>All Orders</span>
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Scheduled</span>
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>In Progress</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Completed</span>
                </TabsTrigger>
                <TabsTrigger value="past-due" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Past Due</span>
                </TabsTrigger>
              </TabsList>
              <div className="flex justify-end">
                <Button variant="outline" className="ml-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </Tabs>
            
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search by ID, address, owner, or community..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" className="flex items-center">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
            
            {/* Order queue table */}
            <div className="rounded-md border">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Order Queue</h3>
                  <p className="text-sm text-gray-500">Showing {filteredData.length} of {orderQueueData.length} orders</p>
                </div>
                <p className="text-sm text-gray-500">Manage and process resale documentation orders</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Order #</TableHead>
                    <TableHead className="whitespace-nowrap">Address</TableHead>
                    <TableHead className="whitespace-nowrap">Owner/Seller</TableHead>
                    <TableHead className="whitespace-nowrap">Community</TableHead>
                    <TableHead className="whitespace-nowrap">Type</TableHead>
                    <TableHead className="whitespace-nowrap">Priority</TableHead>
                    <TableHead className="whitespace-nowrap">Scheduled</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">{order.address}</TableCell>
                        <TableCell>{order.ownerSeller}</TableCell>
                        <TableCell>{order.community}</TableCell>
                        <TableCell>{order.type}</TableCell>
                        <TableCell>{renderPriorityBadge(order.priority)}</TableCell>
                        <TableCell>{order.scheduledDate}</TableCell>
                        <TableCell>{renderStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Edit">
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Download">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">No orders found matching the current filters.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default OrderQueue;
