
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Wrench, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageTemplate from '@/components/layout/PageTemplate';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import WorkOrderTable from '@/components/work-orders/WorkOrderTable';
import WorkOrderForm from '@/components/work-orders/WorkOrderForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const MaintenanceRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // For demo purposes, using a default association ID
  const defaultAssociationId = 'demo-association-id';
  const { data: workOrders = [], isLoading, error } = useWorkOrders(defaultAssociationId);

  const filteredWorkOrders = workOrders.filter(workOrder => {
    const matchesSearch = 
      workOrder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workOrder.description && workOrder.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || workOrder.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || workOrder.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusCounts = () => {
    const counts = {
      total: workOrders.length,
      open: workOrders.filter(w => w.status === 'open').length,
      in_progress: workOrders.filter(w => w.status === 'in_progress').length,
      completed: workOrders.filter(w => w.status === 'completed').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (error) {
    console.error('Error loading work orders:', error);
  }

  return (
    <PageTemplate
      title="Maintenance & Work Orders"
      icon={<Wrench className="h-8 w-8" />}
      description="Manage property maintenance requests and work orders"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statusCounts.total}</div>
              <p className="text-sm text-muted-foreground">Total Work Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{statusCounts.open}</div>
              <p className="text-sm text-muted-foreground">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.in_progress}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                className="pl-10 w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
        </div>

        {/* Work Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Work Orders ({filteredWorkOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading work orders...</div>
            ) : filteredWorkOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'No work orders match your filters'
                  : 'No work orders found. Create your first work order to get started.'
                }
              </div>
            ) : (
              <WorkOrderTable workOrders={filteredWorkOrders} />
            )}
          </CardContent>
        </Card>

        {/* Create Work Order Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <WorkOrderForm
              associationId={defaultAssociationId}
              onClose={() => setShowCreateForm(false)}
              onSuccess={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageTemplate>
  );
};

export default MaintenanceRequests;
