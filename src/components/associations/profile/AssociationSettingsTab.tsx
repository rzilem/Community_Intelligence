
import React, { useState } from "react";
import { Association } from "@/types/association-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AssociationSettingsTabProps {
  association: Association;
  onSave: (data: Partial<Association>) => Promise<void>;
  saving?: boolean;
}

export const AssociationSettingsTab: React.FC<AssociationSettingsTabProps> = ({
  association,
  onSave,
  saving = false,
}) => {
  // Clone needed fields for editing
  const [form, setForm] = useState({
    name: association.name ?? "",
    contact_email: association.contact_email ?? "",
    phone: association.phone ?? "",
    website: association.website ?? "",
    address: association.address ?? "",
    city: association.city ?? "",
    state: association.state ?? "",
    zip: association.zip ?? "",
    primary_color: association.primary_color ?? "#9b87f5", // Default primary color
    secondary_color: association.secondary_color ?? "#7E69AB", // Default secondary color
    founded_date: association.founded_date ?? "",
    insurance_expiration: association.insurance_expiration ?? "",
    fire_inspection_due: association.fire_inspection_due ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(form);
      toast.success("Association settings updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Association Settings</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Association Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter association name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={form.contact_email}
                  onChange={handleChange}
                  placeholder="Enter contact email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="Enter website URL"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter street address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip">Zip</Label>
                <Input
                  id="zip"
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  placeholder="Enter zip code"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Brand Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    name="primary_color"
                    value={form.primary_color}
                    onChange={handleChange}
                    placeholder="Enter primary color (e.g., #9b87f5)"
                  />
                  <div 
                    className="w-10 h-10 rounded border" 
                    style={{ backgroundColor: form.primary_color || '#fff' }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Brand Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    name="secondary_color"
                    value={form.secondary_color}
                    onChange={handleChange}
                    placeholder="Enter secondary color (e.g., #7E69AB)"
                  />
                  <div 
                    className="w-10 h-10 rounded border" 
                    style={{ backgroundColor: form.secondary_color || '#fff' }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="founded_date">Founded Date</Label>
                <Input
                  id="founded_date"
                  name="founded_date"
                  type="date"
                  value={form.founded_date}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insurance_expiration">Insurance Expiration</Label>
                <Input
                  id="insurance_expiration"
                  name="insurance_expiration"
                  type="date"
                  value={form.insurance_expiration}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fire_inspection_due">Fire Inspection Due</Label>
                <Input
                  id="fire_inspection_due"
                  name="fire_inspection_due"
                  type="date"
                  value={form.fire_inspection_due}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mt-8">
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={saving}
              >
                {saving ? "Saving Settings..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssociationSettingsTab;
