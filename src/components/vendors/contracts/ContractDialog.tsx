
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
import { vendorContractService } from "@/services/vendor-contract-service";
import { useAuth } from "@/contexts/auth";

interface ContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  contract?: any;
}

const ContractDialog: React.FC<ContractDialogProps> = ({
  open,
  onOpenChange,
  vendorId,
  contract
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentAssociation } = useAuth();

  const createMutation = useMutation({
    mutationFn: vendorContractService.createVendorContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts', vendorId] });
      onOpenChange(false);
      toast({ title: "Contract created successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error creating contract", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      vendorContractService.updateVendorContract(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts', vendorId] });
      onOpenChange(false);
      toast({ title: "Contract updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating contract", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const contractData = {
      vendor_id: vendorId,
      association_id: currentAssociation?.id,
      contract_title: formData.get('contract_title') as string,
      contract_type: formData.get('contract_type') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      contract_value: formData.get('contract_value') ? Number(formData.get('contract_value')) : undefined,
      contract_terms: formData.get('contract_terms') as string,
      auto_renew: formData.get('auto_renew') === 'on',
      renewal_notice_days: Number(formData.get('renewal_notice_days')) || 30,
      payment_terms: formData.get('payment_terms') as string,
      status: 'draft'
    };

    if (contract) {
      updateMutation.mutate({ id: contract.id, data: contractData });
    } else {
      createMutation.mutate(contractData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {contract ? 'Edit Contract' : 'Create New Contract'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract_title">Contract Title</Label>
              <Input 
                id="contract_title" 
                name="contract_title" 
                defaultValue={contract?.contract_title}
                required 
              />
            </div>
            <div>
              <Label htmlFor="contract_type">Contract Type</Label>
              <Select name="contract_type" defaultValue={contract?.contract_type || 'service'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service Contract</SelectItem>
                  <SelectItem value="maintenance">Maintenance Agreement</SelectItem>
                  <SelectItem value="emergency">Emergency Services</SelectItem>
                  <SelectItem value="annual">Annual Contract</SelectItem>
                  <SelectItem value="custom">Custom Agreement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input 
                id="start_date" 
                name="start_date" 
                type="date"
                defaultValue={contract?.start_date}
                required 
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input 
                id="end_date" 
                name="end_date" 
                type="date"
                defaultValue={contract?.end_date}
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract_value">Contract Value ($)</Label>
              <Input 
                id="contract_value" 
                name="contract_value" 
                type="number"
                step="0.01"
                defaultValue={contract?.contract_value}
              />
            </div>
            <div>
              <Label htmlFor="renewal_notice_days">Renewal Notice (Days)</Label>
              <Input 
                id="renewal_notice_days" 
                name="renewal_notice_days" 
                type="number"
                defaultValue={contract?.renewal_notice_days || 30}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="payment_terms">Payment Terms</Label>
            <Input 
              id="payment_terms" 
              name="payment_terms" 
              defaultValue={contract?.payment_terms}
              placeholder="e.g., Net 30 days"
            />
          </div>

          <div>
            <Label htmlFor="contract_terms">Contract Terms</Label>
            <Textarea 
              id="contract_terms" 
              name="contract_terms" 
              defaultValue={contract?.contract_terms}
              rows={4}
              placeholder="Enter contract terms and conditions..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="auto_renew" 
              name="auto_renew"
              defaultChecked={contract?.auto_renew}
            />
            <Label htmlFor="auto_renew">Enable Auto-Renewal</Label>
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
                ? (contract ? 'Updating...' : 'Creating...') 
                : (contract ? 'Update Contract' : 'Create Contract')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContractDialog;
