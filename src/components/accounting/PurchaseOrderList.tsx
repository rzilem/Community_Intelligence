import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, Edit, Check, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PurchaseOrderService, PurchaseOrderWithLines } from '@/services/accounting/purchase-order-service';
import PurchaseOrderDialog from './PurchaseOrderDialog';

interface PurchaseOrderListProps {
  associationId: string;
}

const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({ associationId }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderWithLines[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrderWithLines[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrderWithLines | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    loadPurchaseOrders();
  }, [associationId]);

  useEffect(() => {
    filterOrders();
  }, [purchaseOrders, searchTerm, statusFilter]);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const orders = await PurchaseOrderService.getPurchaseOrders(associationId);
      setPurchaseOrders(orders);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      toast({
        title: "Error",
        description: "Failed to load purchase orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = purchaseOrders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleApprove = async (order: PurchaseOrderWithLines) => {
    try {
      const approvalLevel = PurchaseOrderService.getRequiredApprovalLevel(order.total_amount || 0);
      await PurchaseOrderService.approvePurchaseOrder(order.id, approvalLevel);
      
      toast({
        title: "Success",
        description: "Purchase order approved successfully",
      });
      
      loadPurchaseOrders();
    } catch (error) {
      console.error('Error approving purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to approve purchase order",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (order: PurchaseOrderWithLines) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      await PurchaseOrderService.rejectPurchaseOrder(order.id, reason);
      
      toast({
        title: "Success",
        description: "Purchase order rejected",
      });
      
      loadPurchaseOrders();
    } catch (error) {
      console.error('Error rejecting purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to reject purchase order",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status?: string, approvalStatus?: string) => {
    if (status === 'draft') {
      return <Badge variant="secondary">Draft</Badge>;
    }
    if (status === 'pending_approval') {
      return <Badge variant="outline">Pending Approval</Badge>;
    }
    if (approvalStatus === 'approved') {
      return <Badge variant="default">Approved</Badge>;
    }
    if (approvalStatus === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (status === 'received') {
      return <Badge variant="default">Received</Badge>;
    }
    if (status === 'partially_received') {
      return <Badge variant="outline">Partially Received</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const canApprove = (order: PurchaseOrderWithLines) => {
    return order.status === 'pending_approval' && order.approval_status === 'pending';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading purchase orders...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Purchase Orders</CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Purchase Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by PO number, vendor, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="partially_received">Partially Received</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Purchase Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.po_number}</TableCell>
                    <TableCell>{order.vendor_name || 'Unknown Vendor'}</TableCell>
                    <TableCell>${order.total_amount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{getStatusBadge(order.status, order.approval_status)}</TableCell>
                    <TableCell className="text-sm">
                      {order.requested_by || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {order.po_date ? new Date(order.po_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: View details */}}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {(order.status === 'draft' || order.status === 'rejected') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingOrder(order)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        {canApprove(order) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(order)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(order)}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: Generate PDF */}}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {purchaseOrders.length === 0 
                  ? "No purchase orders found. Create your first purchase order to get started."
                  : "No purchase orders match your current filters."
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <PurchaseOrderDialog
        open={showCreateDialog || !!editingOrder}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingOrder(undefined);
          }
        }}
        purchaseOrder={editingOrder}
        associationId={associationId}
        onSave={() => {
          loadPurchaseOrders();
          setShowCreateDialog(false);
          setEditingOrder(undefined);
        }}
      />
    </>
  );
};

export default PurchaseOrderList;