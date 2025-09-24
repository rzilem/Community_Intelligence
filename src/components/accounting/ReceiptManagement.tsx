import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, CheckCircle, AlertTriangle, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReceiptService, CreateReceiptData, ReceiptWithLines } from '@/services/accounting/receipt-service';
import { PurchaseOrderService } from '@/services/accounting/purchase-order-service';

interface ReceiptManagementProps {
  associationId: string;
}

interface POSummaryItem {
  id: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_received: number;
  remaining_quantity: number;
  receipt_percentage: number;
  is_fully_received: boolean;
}

const ReceiptManagement: React.FC<ReceiptManagementProps> = ({ associationId }) => {
  const [receipts, setReceipts] = useState<ReceiptWithLines[]>([]);
  const [pendingPOs, setPendingPOs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [poSummary, setPOSummary] = useState<POSummaryItem[]>([]);
  const [receiptData, setReceiptData] = useState({
    delivery_note: '',
    line_items: [] as Array<{
      po_line_id: string;
      quantity_received: number;
      unit_price?: number;
      condition: string;
      notes: string;
    }>
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [associationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [receiptsData, posData] = await Promise.all([
        ReceiptService.getReceipts(associationId),
        PurchaseOrderService.getPurchaseOrders(associationId)
      ]);
      
      setReceipts(receiptsData);
      
      // Filter POs that are approved but not fully received
      const pendingReceiptPOs = posData.filter(po => 
        po.status === 'approved'
      );
      setPendingPOs(pendingReceiptPOs);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load receipt data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPO = async (po: any) => {
    try {
      setSelectedPO(po);
      const summary = await ReceiptService.getPOReceiptSummary(po.id);
      setPOSummary(summary);
      
      // Initialize receipt line items
      const lineItems = summary
        .filter(item => !item.is_fully_received)
        .map(item => ({
          po_line_id: item.id,
          quantity_received: Math.min(1, item.remaining_quantity),
          unit_price: item.unit_price,
          condition: 'good',
          notes: ''
        }));
      
      setReceiptData({
        delivery_note: '',
        line_items: lineItems
      });
      
      setShowCreateDialog(true);
    } catch (error) {
      console.error('Error loading PO summary:', error);
      toast({
        title: "Error",
        description: "Failed to load purchase order details",
        variant: "destructive",
      });
    }
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const updatedItems = [...receiptData.line_items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setReceiptData({ ...receiptData, line_items: updatedItems });
  };

  const handleCreateReceipt = async () => {
    if (!selectedPO || receiptData.line_items.length === 0) {
      toast({
        title: "Error",
        description: "Please select items to receive",
        variant: "destructive",
      });
      return;
    }

    try {
      const createData: CreateReceiptData = {
        po_id: selectedPO.id,
        received_date: new Date().toISOString().split('T')[0],
        received_by: 'current-user',
        total_amount: receiptData.line_items.reduce((sum, item) => sum + (item.quantity_received * (item.unit_price || 0)), 0),
        status: 'complete',
        receipt_lines: receiptData.line_items.filter(item => item.quantity_received > 0).map(item => ({
          po_line_id: item.po_line_id,
          quantity_received: item.quantity_received,
          unit_cost: item.unit_price || 0,
          line_total: item.quantity_received * (item.unit_price || 0),
          condition: 'good' as const
        }))
      };

      await ReceiptService.createReceipt(createData);
      
      toast({
        title: "Success",
        description: "Receipt created successfully",
      });
      
      loadData();
      setShowCreateDialog(false);
      setSelectedPO(null);
    } catch (error) {
      console.error('Error creating receipt:', error);
      toast({
        title: "Error",
        description: "Failed to create receipt",
        variant: "destructive",
      });
    }
  };

  const getReceiptStatusBadge = (status?: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="default">Received</Badge>;
      case 'damaged':
        return <Badge variant="destructive">Damaged</Badge>;
      case 'partial':
        return <Badge variant="outline">Partial</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'text-green-600';
      case 'damaged': return 'text-red-600';
      case 'poor': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receipt Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading receipt data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Pending Receipts */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pending Receipts
              </CardTitle>
              <Badge variant="outline">
                {pendingPOs.length} PO(s) awaiting receipt
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {pendingPOs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No purchase orders pending receipt
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>PO Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPOs.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.po_number}</TableCell>
                        <TableCell>{po.vendor_name}</TableCell>
                        <TableCell>${po.total_amount?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={po.status === 'approved' ? 'default' : 'outline'}>
                            {po.status === 'approved' ? 'Ready to Receive' : 'Partially Received'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {po.po_date ? new Date(po.po_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectPO(po)}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Receive Items
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            {receipts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No receipts recorded yet
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Received By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.slice(0, 10).map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">{receipt.receipt_number}</TableCell>
                        <TableCell>{receipt.purchase_order?.po_number}</TableCell>
                        <TableCell>{receipt.vendor_name}</TableCell>
                        <TableCell>${receipt.total_received?.toFixed(2)}</TableCell>
                        <TableCell>{getReceiptStatusBadge(receipt.status)}</TableCell>
                        <TableCell>{receipt.received_by_name}</TableCell>
                        <TableCell>
                          {receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Receipt Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Receive Items - PO {selectedPO?.po_number}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vendor</Label>
                <div className="font-medium">{selectedPO?.vendor_name}</div>
              </div>
              <div>
                <Label>PO Amount</Label>
                <div className="font-medium">${selectedPO?.total_amount?.toFixed(2)}</div>
              </div>
            </div>

            <div>
              <Label htmlFor="delivery_note">Delivery Note / Comments</Label>
              <Textarea
                id="delivery_note"
                value={receiptData.delivery_note}
                onChange={(e) => setReceiptData({ ...receiptData, delivery_note: e.target.value })}
                placeholder="Enter any delivery notes or comments"
                rows={3}
              />
            </div>

            {/* Line Items */}
            <div>
              <Label className="text-lg font-semibold">Items to Receive</Label>
              <div className="mt-4 space-y-4">
                {poSummary.map((item, index) => {
                  const lineItemIndex = receiptData.line_items.findIndex(li => li.po_line_id === item.id);
                  const lineItem = lineItemIndex >= 0 ? receiptData.line_items[lineItemIndex] : null;
                  
                  return (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <div className="col-span-2">
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-muted-foreground">
                            Ordered: {item.quantity} | Received: {item.total_received} | 
                            Remaining: {item.remaining_quantity}
                          </div>
                        </div>

                        <div>
                          <Label>Quantity Received</Label>
                          <Input
                            type="number"
                            min="0"
                            max={item.remaining_quantity}
                            value={lineItem?.quantity_received || 0}
                            onChange={(e) => {
                              const qty = parseFloat(e.target.value) || 0;
                              if (lineItemIndex >= 0) {
                                updateLineItem(lineItemIndex, 'quantity_received', qty);
                              }
                            }}
                          />
                        </div>

                        <div>
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={lineItem?.unit_price || item.unit_price}
                            onChange={(e) => {
                              const price = parseFloat(e.target.value) || 0;
                              if (lineItemIndex >= 0) {
                                updateLineItem(lineItemIndex, 'unit_price', price);
                              }
                            }}
                          />
                        </div>

                        <div>
                          <Label>Condition</Label>
                          <select
                            className="w-full p-2 border rounded"
                            value={lineItem?.condition || 'good'}
                            onChange={(e) => {
                              if (lineItemIndex >= 0) {
                                updateLineItem(lineItemIndex, 'condition', e.target.value);
                              }
                            }}
                          >
                            <option value="good">Good</option>
                            <option value="damaged">Damaged</option>
                            <option value="poor">Poor</option>
                          </select>
                        </div>

                        <div>
                          <Label>Line Total</Label>
                          <div className="font-semibold">
                            ${((lineItem?.quantity_received || 0) * (lineItem?.unit_price || item.unit_price)).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {lineItem && lineItem.quantity_received > 0 && (
                        <div className="mt-4">
                          <Label>Notes</Label>
                          <Input
                            value={lineItem.notes}
                            onChange={(e) => updateLineItem(lineItemIndex, 'notes', e.target.value)}
                            placeholder="Any specific notes for this item"
                          />
                        </div>
                      )}

                      <div className="mt-2 flex justify-between items-center">
                        <div className={`text-sm ${getConditionColor(lineItem?.condition || 'good')}`}>
                          Condition: {lineItem?.condition || 'good'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.receipt_percentage.toFixed(0)}% received
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateReceipt}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Receipt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptManagement;