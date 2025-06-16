
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApplicationService } from "@/services/vendor-application-service";
import { useAuth } from "@/contexts/auth";
import { VendorApplication } from "@/types/contract-types";

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: VendorApplication;
}

const ApplicationDialog: React.FC<ApplicationDialogProps> = ({
  open,
  onOpenChange,
  application
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentAssociation } = useAuth();

  const createMutation = useMutation({
    mutationFn: vendorApplicationService.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-applications'] });
      onOpenChange(false);
      toast({ title: "Application created successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error creating application", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<VendorApplication> }) => 
      vendorApplicationService.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-applications'] });
      onOpenChange(false);
      toast({ title: "Application updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating application", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const applicationData = {
      association_id: currentAssociation?.id,
      business_name: formData.get('business_name') as string,
      contact_person: formData.get('contact_person') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      business_address: formData.get('business_address') as string,
      tax_id: formData.get('tax_id') as string,
      license_number: formData.get('license_number') as string,
      insurance_provider: formData.get('insurance_provider') as string,
      insurance_policy_number: formData.get('insurance_policy_number') as string,
      insurance_expiry_date: formData.get('insurance_expiry_date') as string,
      bond_amount: formData.get('bond_amount') ? Number(formData.get('bond_amount')) : undefined,
      bond_expiry_date: formData.get('bond_expiry_date') as string,
      years_in_business: formData.get('years_in_business') ? Number(formData.get('years_in_business')) : undefined,
      application_status: (formData.get('application_status') || 'pending') as VendorApplication['application_status'],
      background_check_status: 'not_started' as const,
      notes: formData.get('notes') as string
    };

    if (application) {
      updateMutation.mutate({ id: application.id, data: applicationData });
    } else {
      createMutation.mutate(applicationData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {application ? 'Edit Application' : 'New Vendor Application'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_name">Business Name</Label>
              <Input 
                id="business_name" 
                name="business_name" 
                defaultValue={application?.business_name}
                required 
              />
            </div>
            <div>
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input 
                id="contact_person" 
                name="contact_person" 
                defaultValue={application?.contact_person}
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                defaultValue={application?.email}
                required 
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                name="phone" 
                defaultValue={application?.phone}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="business_address">Business Address</Label>
            <Textarea 
              id="business_address" 
              name="business_address" 
              defaultValue={application?.business_address}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input 
                id="tax_id" 
                name="tax_id" 
                defaultValue={application?.tax_id}
              />
            </div>
            <div>
              <Label htmlFor="license_number">License Number</Label>
              <Input 
                id="license_number" 
                name="license_number" 
                defaultValue={application?.license_number}
              />
            </div>
            <div>
              <Label htmlFor="years_in_business">Years in Business</Label>
              <Input 
                id="years_in_business" 
                name="years_in_business" 
                type="number"
                defaultValue={application?.years_in_business}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="insurance_provider">Insurance Provider</Label>
              <Input 
                id="insurance_provider" 
                name="insurance_provider" 
                defaultValue={application?.insurance_provider}
              />
            </div>
            <div>
              <Label htmlFor="insurance_policy_number">Policy Number</Label>
              <Input 
                id="insurance_policy_number" 
                name="insurance_policy_number" 
                defaultValue={application?.insurance_policy_number}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="insurance_expiry_date">Insurance Expiry</Label>
              <Input 
                id="insurance_expiry_date" 
                name="insurance_expiry_date" 
                type="date"
                defaultValue={application?.insurance_expiry_date}
              />
            </div>
            <div>
              <Label htmlFor="bond_amount">Bond Amount ($)</Label>
              <Input 
                id="bond_amount" 
                name="bond_amount" 
                type="number"
                step="0.01"
                defaultValue={application?.bond_amount}
              />
            </div>
            <div>
              <Label htmlFor="bond_expiry_date">Bond Expiry</Label>
              <Input 
                id="bond_expiry_date" 
                name="bond_expiry_date" 
                type="date"
                defaultValue={application?.bond_expiry_date}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="application_status">Status</Label>
            <Select name="application_status" defaultValue={application?.application_status || 'pending'}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="requires_info">Requires Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              defaultValue={application?.notes}
              rows={4}
            />
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
                ? (application ? 'Updating...' : 'Creating...') 
                : (application ? 'Update Application' : 'Create Application')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDialog;
