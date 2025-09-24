
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorComplianceService } from "@/services/vendor-compliance-service";
import { useAuth } from "@/contexts/auth";
import { VendorComplianceItem } from "@/types/contract-types";

interface ComplianceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  complianceItem?: VendorComplianceItem;
}

const ComplianceDialog: React.FC<ComplianceDialogProps> = ({
  open,
  onOpenChange,
  vendorId,
  complianceItem
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentAssociation } = useAuth();

  const createMutation = useMutation({
    mutationFn: vendorComplianceService.createComplianceItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-compliance', vendorId] });
      onOpenChange(false);
      toast({ title: "Compliance item created successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error creating compliance item", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<VendorComplianceItem> }) => 
      vendorComplianceService.updateComplianceItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-compliance', vendorId] });
      onOpenChange(false);
      toast({ title: "Compliance item updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating compliance item", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData = {
      vendor_id: vendorId,
      association_id: currentAssociation?.id,
      compliance_type: formData.get('compliance_type') as VendorComplianceItem['compliance_type'],
      item_name: formData.get('item_name') as string,
      description: formData.get('description') as string,
      required: formData.get('required') === 'on',
      status: formData.get('status') as VendorComplianceItem['status'],
      document_url: formData.get('document_url') as string,
      issue_date: formData.get('issue_date') as string,
      expiry_date: formData.get('expiry_date') as string,
      renewal_notice_days: Number(formData.get('renewal_notice_days')) || 30,
      notes: formData.get('notes') as string
    };

    if (complianceItem) {
      updateMutation.mutate({ id: complianceItem.id, data: itemData });
    } else {
      createMutation.mutate({
        ...itemData,
        verified_at: null,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {complianceItem ? 'Edit Compliance Item' : 'Add Compliance Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item_name">Item Name</Label>
              <Input 
                id="item_name" 
                name="item_name" 
                defaultValue={complianceItem?.item_name}
                required 
              />
            </div>
            <div>
              <Label htmlFor="compliance_type">Compliance Type</Label>
              <Select name="compliance_type" defaultValue={complianceItem?.compliance_type || 'insurance'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                  <SelectItem value="background_check">Background Check</SelectItem>
                  <SelectItem value="bond">Bond</SelectItem>
                  <SelectItem value="permit">Permit</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={complianceItem?.description}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={complianceItem?.status || 'pending'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="renewal_notice_days">Renewal Notice (Days)</Label>
              <Input 
                id="renewal_notice_days" 
                name="renewal_notice_days" 
                type="number"
                defaultValue={complianceItem?.renewal_notice_days || 30}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issue_date">Issue Date</Label>
              <Input 
                id="issue_date" 
                name="issue_date" 
                type="date"
                defaultValue={complianceItem?.issue_date}
              />
            </div>
            <div>
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input 
                id="expiry_date" 
                name="expiry_date" 
                type="date"
                defaultValue={complianceItem?.expiry_date}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="document_url">Document URL</Label>
            <Input 
              id="document_url" 
              name="document_url" 
              defaultValue={complianceItem?.document_url}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              defaultValue={complianceItem?.notes}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="required" 
              name="required"
              defaultChecked={complianceItem?.required}
            />
            <Label htmlFor="required">Required Item</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? (complianceItem ? 'Updating...' : 'Creating...') 
                : (complianceItem ? 'Update Item' : 'Create Item')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceDialog;
