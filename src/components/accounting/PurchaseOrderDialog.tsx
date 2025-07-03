import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PurchaseOrderService, CreatePurchaseOrderData, PurchaseOrderWithLines } from '@/services/accounting/purchase-order-service';

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder?: PurchaseOrderWithLines;
  associationId: string;
  onSave?: () => void;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  gl_account_code?: string;
}

const PurchaseOrderDialog: React.FC<PurchaseOrderDialogProps> = ({
  open,
  onOpenChange,
  purchaseOrder,
  associationId,
  onSave
}) => {
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([]);
  const [glAccounts, setGLAccounts] = useState<Array<{ code: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    vendor_id: '',
    description: '',
    department: '',
    line_items: [{ description: '', quantity: 1, unit_price: 0, gl_account_code: '' }] as LineItem[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadVendors();
      loadGLAccounts();
      
      if (purchaseOrder) {
        setFormData({
          vendor_id: purchaseOrder.vendor_id || '',
          description: purchaseOrder.description || '',
          department: purchaseOrder.department || '',
          line_items: purchaseOrder.purchase_order_lines?.map(line => ({
            description: line.description || '',
            quantity: line.quantity || 1,
            unit_price: line.unit_price || 0,
            gl_account_code: line.gl_account_code || ''
          })) || [{ description: '', quantity: 1, unit_price: 0, gl_account_code: '' }]
        });
      } else {
        setFormData({
          vendor_id: '',
          description: '',
          department: '',
          line_items: [{ description: '', quantity: 1, unit_price: 0, gl_account_code: '' }]
        });
      }
    }
  }, [open, purchaseOrder]);

  const loadVendors = async () => {
    try {
      // Mock vendors for now - replace with actual vendor service
      setVendors([
        { id: '1', name: 'ABC Supply Co' },
        { id: '2', name: 'XYZ Services' },
        { id: '3', name: 'Professional Maintenance' }
      ]);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const loadGLAccounts = async () => {
    try {
      // Mock GL accounts for now - replace with actual GL accounts service
      setGLAccounts([
        { code: '5100', name: 'Maintenance & Repairs' },
        { code: '5200', name: 'Utilities' },
        { code: '5300', name: 'Insurance' },
        { code: '5400', name: 'Professional Services' },
        { code: '6100', name: 'Office Supplies' }
      ]);
    } catch (error) {
      console.error('Error loading GL accounts:', error);
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...formData.line_items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, line_items: updatedItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      line_items: [...formData.line_items, { description: '', quantity: 1, unit_price: 0, gl_account_code: '' }]
    });
  };

  const removeLineItem = (index: number) => {
    if (formData.line_items.length > 1) {
      const updatedItems = formData.line_items.filter((_, i) => i !== index);
      setFormData({ ...formData, line_items: updatedItems });
    }
  };

  const calculateTotal = () => {
    return formData.line_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSave = async (submitForApproval = false) => {
    if (!formData.vendor_id) {
      toast({
        title: "Error",
        description: "Please select a vendor",
        variant: "destructive",
      });
      return;
    }

    if (formData.line_items.some(item => !item.description || item.quantity <= 0 || item.unit_price <= 0)) {
      toast({
        title: "Error",
        description: "Please fill in all line item details",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (purchaseOrder) {
        // Update existing PO
        await PurchaseOrderService.updatePurchaseOrder(
          purchaseOrder.id,
          {
            vendor_id: formData.vendor_id,
            description: formData.description,
            department: formData.department,
            total_amount: calculateTotal()
          },
          formData.line_items.map((item, index) => ({
            line_number: index + 1,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            line_total: item.quantity * item.unit_price,
            gl_account_code: item.gl_account_code
          }))
        );

        if (submitForApproval) {
          await PurchaseOrderService.submitForApproval(purchaseOrder.id);
        }
      } else {
        // Create new PO
        const createData: CreatePurchaseOrderData = {
          vendor_id: formData.vendor_id,
          association_id: associationId,
          description: formData.description,
          department: formData.department,
          line_items: formData.line_items
        };

        const newPOId = await PurchaseOrderService.createPurchaseOrder(createData);

        if (submitForApproval) {
          await PurchaseOrderService.submitForApproval(newPOId);
        }
      }

      toast({
        title: "Success",
        description: `Purchase Order ${submitForApproval ? 'submitted for approval' : 'saved'} successfully`,
      });

      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to save purchase order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {purchaseOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendor">Vendor *</Label>
              <Select
                value={formData.vendor_id}
                onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Maintenance, Administration"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Overall description of the purchase order"
              rows={3}
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </div>

            <div className="space-y-4">
              {formData.line_items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Line {index + 1}</span>
                    {formData.line_items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label>Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>

                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <Label>Unit Price *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>GL Account</Label>
                      <Select
                        value={item.gl_account_code}
                        onValueChange={(value) => updateLineItem(index, 'gl_account_code', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select GL account" />
                        </SelectTrigger>
                        <SelectContent>
                          {glAccounts.map((account) => (
                            <SelectItem key={account.code} value={account.code}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <div className="w-full">
                        <Label>Line Total</Label>
                        <div className="text-lg font-semibold">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Total Amount: ${calculateTotal().toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Approval Level: {PurchaseOrderService.getRequiredApprovalLevel(calculateTotal())}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseOrderDialog;