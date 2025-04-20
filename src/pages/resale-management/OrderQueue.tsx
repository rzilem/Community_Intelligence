
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Download,
  Plus
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
import { ResaleOrder, ResalePriority, ResaleOrderStatus } from '@/types/resale-order-types';
import { useResaleOrders } from '@/hooks/resale/useResaleOrders';
import { toast } from 'sonner';

const OrderQueue = () => {
  const navigate = useNavigate();
  const { orders, isLoading, error, refreshOrders } = useResaleOrders();
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState<string>('All Priorities');
  const [typeFilter, setTypeFilter] = useState<string>('All Types');
  const [activeTab, setActiveTab] = useState('all');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Filter the data based on the current filters and search term
  const filteredOrders = orders.filter(order => {
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

  // Handle refresh 
  const handleRefresh = () => {
    refreshOrders();
    setLastRefreshed(new Date());
    toast.success('Resale orders refreshed');
  };

  // Get unique values for filters
  const statusOptions = ['All Statuses', ...Array.from(new Set(orders.map(order => order.status)))];
  const priorityOptions = ['All Priorities', ...Array.from(new Set(orders.map(order => order.priority)))];
  const typeOptions = ['All Types', ...Array.from(new Set(orders.map(order => order.type)))];

  // Action handlers
  const handleViewOrder = (id: string) => {
    toast.info(`Viewing order ${id}`);
    // In a real implementation, this would navigate to a detail view
    // navigate(`/resale-management/certificate/${id}`);
  };

  const handleEditOrder = (id: string) => {
    toast.info(`Editing order ${id}`);
    // In a real implementation, this would navigate to an edit view
    // navigate(`/resale-management/certificate/${id}/edit`);
  };

  const handleDownloadOrder = (id: string) => {
    toast.success(`Order ${id} prepared for download`);
    // In a real implementation, this would download the document
  };

  // Helper function to render status badges with appropriate colors
  const renderStatusBadge = (status: ResaleOrderStatus) => {
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
  const renderPriorityBadge = (priority: ResalePriority) => {
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

  // Handle new resale request
  const handleNewResaleRequest = () => {
    toast.info('Creating new resale request');
    // In a real implementation, this would navigate to a create form
    // navigate('/resale-management/certificate/new');
  };

  return (
    <PageTemplate 
      title="Resale Management" 
      icon={<ListOrdered className="h-8 w-8" />}
      description="Process and manage property resale documentation"
    >
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Process and manage property resale documentation</p>
        <Button className="gap-2" onClick={handleNewResaleRequest}>
          <Plus className="h-4 w-4" /> New Resale Request
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleRefresh}>
                  <ArrowDownUp className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline">
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
                  <p className="text-sm text-gray-500">Showing {filteredOrders.length} of {orders.length} orders</p>
                </div>
                <p className="text-sm text-gray-500">Manage and process resale documentation orders</p>
              </div>
              
              {isLoading ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Loading resale orders...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
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
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
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
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="View"
                                onClick={() => handleViewOrder(order.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Edit"
                                onClick={() => handleEditOrder(order.id)}
                              >
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Download"
                                onClick={() => handleDownloadOrder(order.id)}
                              >
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
              )}
            </div>
            
            {!isLoading && !error && (
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>Showing {filteredOrders.length} of {orders.length} orders</div>
                <div>Last refreshed: {lastRefreshed.toLocaleString()}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default OrderQueue;
