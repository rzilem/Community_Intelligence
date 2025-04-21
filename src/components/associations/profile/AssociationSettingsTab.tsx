
import React, { useState } from "react";
import { Association } from "@/types/association-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/**
 * Keeps the Association Settings form logic focused and maintainable.
 */
interface AssociationSettingsTabProps {
  association: Association;
  onSave: (data: Partial<Association>) => Promise<void>;
}

export const AssociationSettingsTab: React.FC<AssociationSettingsTabProps> = ({
  association,
  onSave,
}) => {
  // Clone needed fields for editing; add more as needed.
  const [form, setForm] = useState({
    name: association.name ?? "",
    contact_email: association.contact_email ?? "",
    phone: association.phone ?? "",
    website: association.website ?? "",
    address: association.address ?? "",
    city: association.city ?? "",
    state: association.state ?? "",
    zip: association.zip ?? "",
    primary_color: association.primary_color ?? "",
    secondary_color: association.secondary_color ?? "",
    founded_date: association.founded_date ?? "",
    insurance_expiration: association.insurance_expiration ?? "",
    fire_inspection_due: association.fire_inspection_due ?? "",
    // ...Add more fields here as needed for settings
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      toast.success("Settings updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  // Field generator for shared styles and clear ux
  const field = (
    label: string,
    name: keyof typeof form,
    type: "text" | "email" | "tel" | "date" = "text"
  ) => (
    <div className="flex flex-col gap-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        value={form[name] || ""}
        onChange={handleChange}
        type={type}
        placeholder={label}
        className="max-w-md"
      />
    </div>
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-4 max-w-xl" onSubmit={handleSubmit}>
          <h3 className="text-lg font-bold mb-2">Association Settings</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {field("Association Name", "name")}
            {field("Contact Email", "contact_email", "email")}
            {field("Phone", "phone", "tel")}
            {field("Website", "website")}
            {field("Address", "address")}
            {field("City", "city")}
            {field("State", "state")}
            {field("Zip", "zip")}
            {field("Primary Brand Color", "primary_color")}
            {field("Secondary Brand Color", "secondary_color")}
            {field("Founded Date", "founded_date")}
            {field("Insurance Expiration", "insurance_expiration", "date")}
            {field("Fire Inspection Due", "fire_inspection_due", "date")}
            {/* Add toggles/checkboxes here for boolean settings if needed */}
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AssociationSettingsTab;
