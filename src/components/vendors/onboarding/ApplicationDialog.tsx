
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApplicationService } from "@/services/vendor-application-service";
import { useAuth } from "@/contexts/auth";

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: any;
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
      queryClient.invalidateQueries({ queryKey: ['vendor-applications', currentAssociation?.id] });
      onOpenChange(false);
      toast({ title: "Application submitted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error submitting application", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const specialties = (formData.get('specialties') as string)
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

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
      insurance_expiry_date: formData.get('insurance_expiry_date') as string || undefined,
      bond_amount: formData.get('bond_amount') ? Number(formData.get('bond_amount')) : undefined,
      bond_expiry_date: formData.get('bond_expiry_date') as string || undefined,
      specialties: specialties.length > 0 ? specialties : undefined,
      years_in_business: formData.get('years_in_business') ? Number(formData.get('years_in_business')) : undefined,
      application_status: 'pending'
    };

    createMutation.mutate(applicationData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vendor Application</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Business Information</h3>
            
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
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tax_id">Tax ID</Label>
                <Input 
                  id="tax_id" 
                  name="tax_id" 
                  defaultValue={application?.tax_id}
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
          </div>

          {/* Licensing & Specialties */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Licensing & Specialties</h3>
            
            <div>
              <Label htmlFor="license_number">License Number</Label>
              <Input 
                id="license_number" 
                name="license_number" 
                defaultValue={application?.license_number}
              />
            </div>

            <div>
              <Label htmlFor="specialties">Specialties (comma-separated)</Label>
              <Input 
                id="specialties" 
                name="specialties" 
                defaultValue={application?.specialties?.join(', ')}
                placeholder="e.g., Plumbing, HVAC, Electrical"
              />
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Insurance Information</h3>
            
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

            <div>
              <Label htmlFor="insurance_expiry_date">Insurance Expiry Date</Label>
              <Input 
                id="insurance_expiry_date" 
                name="insurance_expiry_date" 
                type="date"
                defaultValue={application?.insurance_expiry_date}
              />
            </div>
          </div>

          {/* Bond Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bond Information (if applicable)</h3>
            
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="bond_expiry_date">Bond Expiry Date</Label>
                <Input 
                  id="bond_expiry_date" 
                  name="bond_expiry_date" 
                  type="date"
                  defaultValue={application?.bond_expiry_date}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDialog;
