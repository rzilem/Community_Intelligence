
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VendorFormData, VENDOR_CATEGORIES } from "@/types/vendor-types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Partial<VendorFormData>;
  onSubmit: (data: VendorFormData) => void;
  title: string;
}

const VendorDialog: React.FC<VendorDialogProps> = ({
  open,
  onOpenChange,
  vendor,
  onSubmit,
  title,
}) => {
  const [formData, setFormData] = React.useState<VendorFormData>({
    name: vendor?.name || "",
    contact_person: vendor?.contact_person || "",
    email: vendor?.email || "",
    phone: vendor?.phone || "",
    address: vendor?.address || "",
    license_number: vendor?.license_number || "",
    specialties: vendor?.specialties || [],
    notes: vendor?.notes || "",
    is_active: vendor?.is_active ?? true,
    hoa_id: vendor?.hoa_id || "",
  });

  const handleChange = (field: keyof VendorFormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] px-1">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={formData.contact_person}
                onChange={(e) => handleChange("contact_person", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => handleChange("license_number", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Specialties</Label>
              <ScrollArea className="h-32 border rounded p-2">
                <div className="grid grid-cols-2 gap-2">
                  {VENDOR_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={category}
                        checked={formData.specialties?.includes(category)}
                        onChange={() => handleSpecialtyChange(category)}
                        className="rounded"
                      />
                      <Label htmlFor={category} className="text-sm cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Vendor</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDialog;
