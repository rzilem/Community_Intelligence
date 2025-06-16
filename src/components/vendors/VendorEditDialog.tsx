
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ExtendedVendor } from "@/types/vendor-extended-types";
import { VENDOR_CATEGORIES } from "@/types/vendor-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/ui/file-uploader";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorService } from "@/services/vendor-service";

interface VendorEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: ExtendedVendor;
  onSave: (vendor: ExtendedVendor) => void;
}

const VendorEditDialog: React.FC<VendorEditDialogProps> = ({
  open,
  onOpenChange,
  vendor,
  onSave,
}) => {
  const [formData, setFormData] = useState<ExtendedVendor>(vendor);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateVendorMutation = useMutation({
    mutationFn: async (updatedVendor: ExtendedVendor) => {
      const updateData = {
        name: updatedVendor.name,
        contact_person: updatedVendor.contact_person,
        email: updatedVendor.email,
        phone: updatedVendor.phone,
        address: updatedVendor.address,
        license_number: updatedVendor.license_number,
        specialties: updatedVendor.specialties || [],
        status: updatedVendor.status,
        is_active: updatedVendor.is_active,
        notes: updatedVendor.notes,
        // Extended fields that may not be in the base service
        insurance_expiry_date: updatedVendor.insurance_expiry_date,
        bond_amount: updatedVendor.bond_amount,
        bond_expiry_date: updatedVendor.bond_expiry_date,
        logo_url: updatedVendor.logo_url,
      };
      
      return await vendorService.updateVendor(vendor.id, updateData);
    },
    onSuccess: (updatedVendor) => {
      // Invalidate and refetch vendor queries
      queryClient.invalidateQueries({ queryKey: ['vendor-extended', vendor.id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
      
      toast({
        title: "Vendor updated",
        description: `${updatedVendor.name} has been updated successfully.`,
      });
      
      onSave(updatedVendor as ExtendedVendor);
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating vendor:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: keyof ExtendedVendor, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecialtyChange = (specialty: string) => {
    const currentSpecialties = formData.specialties || [];
    const newSpecialties = currentSpecialties.includes(specialty)
      ? currentSpecialties.filter(s => s !== specialty)
      : [...currentSpecialties, specialty];
    
    setFormData(prev => ({
      ...prev,
      specialties: newSpecialties,
    }));
  };

  const handleLogoUpload = (file: File) => {
    setLogoFile(file);
    // In a real implementation, you would upload the file and get a URL
    const mockUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      logo_url: mockUrl,
    }));
  };

  const handleSave = () => {
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Vendor name is required",
        variant: "destructive",
      });
      return;
    }

    updateVendorMutation.mutate(formData);
  };

  // Reset form data when vendor prop changes
  React.useEffect(() => {
    setFormData(vendor);
  }, [vendor]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Vendor: {vendor.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-1">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Vendor Name*</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person || ''}
                      onChange={(e) => handleChange("contact_person", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number || ''}
                    onChange={(e) => handleChange("license_number", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo/Photo</Label>
                  <FileUploader
                    onFileSelect={handleLogoUpload}
                    accept="image/*"
                    label="Upload vendor logo or photo"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Insurance & Bond Information */}
            <Card>
              <CardHeader>
                <CardTitle>Insurance & Bond Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insurance_expiry_date">Insurance Expiry Date</Label>
                    <Input
                      id="insurance_expiry_date"
                      type="date"
                      value={formData.insurance_expiry_date || ''}
                      onChange={(e) => handleChange("insurance_expiry_date", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bond_amount">Bond Amount</Label>
                    <Input
                      id="bond_amount"
                      type="number"
                      value={formData.bond_amount || ''}
                      onChange={(e) => handleChange("bond_amount", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bond_expiry_date">Bond Expiry Date</Label>
                    <Input
                      id="bond_expiry_date"
                      type="date"
                      value={formData.bond_expiry_date || ''}
                      onChange={(e) => handleChange("bond_expiry_date", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {VENDOR_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={category}
                        checked={formData.specialties?.includes(category) || false}
                        onChange={() => handleSpecialtyChange(category)}
                        className="rounded"
                      />
                      <Label htmlFor={category} className="text-sm cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                  placeholder="Additional notes about this vendor..."
                />
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleChange("is_active", checked)}
                  />
                  <Label>Active Vendor</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateVendorMutation.isPending}
          >
            {updateVendorMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorEditDialog;
