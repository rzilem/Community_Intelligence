
import React, { useState } from "react";
import { Association } from "@/types/association-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Calendar, Percent, Clock, Bell, MessageSquare, AlarmClock } from "lucide-react";

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
  // Clone needed fields for editing, incorporating new advanced settings
  const [form, setForm] = useState({
    name: association.name ?? "",
    contact_email: association.contact_email ?? "",
    phone: association.phone ?? "",
    website: association.website ?? "",
    address: association.address ?? "",
    city: association.city ?? "",
    state: association.state ?? "",
    zip: association.zip ?? "",
    primary_color: association.primary_color ?? "#9b87f5",
    secondary_color: association.secondary_color ?? "#7E69AB",
    founded_date: association.founded_date ?? "",
    insurance_expiration: association.insurance_expiration ?? "",
    fire_inspection_due: association.fire_inspection_due ?? "",
    // New advanced settings
    payment_due_day: association.payment_due_day ?? "",
    late_fee_percentage: association.late_fee_percentage ?? "",
    grace_period_days: association.grace_period_days ?? "",
    email_notifications: association.email_notifications ?? false,
    sms_notifications: association.sms_notifications ?? false,
    auto_reminders: association.auto_reminders ?? false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSwitchChange = (field: string, value: boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
            {/* General Information */}
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

            {/* Divider */}
            <hr className="my-8 border-t border-muted" />

            {/* Assessment Settings Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Assessment Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <Label htmlFor="payment_due_day" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    Payment Due Day
                  </Label>
                  <Input
                    id="payment_due_day"
                    name="payment_due_day"
                    type="number"
                    min={1}
                    max={31}
                    value={form.payment_due_day}
                    onChange={handleChange}
                    placeholder="e.g. 1 (first day of month)"
                  />
                  <span className="text-xs text-muted-foreground">
                    The day of the month assessments are due.
                  </span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="late_fee_percentage" className="flex items-center gap-1">
                    <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                    Late Fee (%)
                  </Label>
                  <Input
                    id="late_fee_percentage"
                    name="late_fee_percentage"
                    type="number"
                    step={0.01}
                    min={0}
                    value={form.late_fee_percentage}
                    onChange={handleChange}
                    placeholder="e.g. 5 (%)"
                  />
                  <span className="text-xs text-muted-foreground">
                    The percentage charged as a late fee.
                  </span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="grace_period_days" className="flex items-center gap-1">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Grace Period (Days)
                  </Label>
                  <Input
                    id="grace_period_days"
                    name="grace_period_days"
                    type="number"
                    min={0}
                    value={form.grace_period_days}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                  />
                  <span className="text-xs text-muted-foreground">
                    Number of days after due date before a late fee applies.
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-8 border-t border-muted" />

            {/* Communication Preferences Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Communication Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="email_notifications"
                    checked={!!form.email_notifications}
                    onCheckedChange={(checked) => handleSwitchChange("email_notifications", !!checked)}
                  />
                  <Label htmlFor="email_notifications" className="flex items-center gap-1 cursor-pointer">
                    <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                    Email Notifications
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch
                    id="sms_notifications"
                    checked={!!form.sms_notifications}
                    onCheckedChange={(checked) => handleSwitchChange("sms_notifications", !!checked)}
                  />
                  <Label htmlFor="sms_notifications" className="flex items-center gap-1 cursor-pointer">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    SMS Notifications
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch
                    id="auto_reminders"
                    checked={!!form.auto_reminders}
                    onCheckedChange={(checked) => handleSwitchChange("auto_reminders", !!checked)}
                  />
                  <Label htmlFor="auto_reminders" className="flex items-center gap-1 cursor-pointer">
                    <AlarmClock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Auto-Reminders
                  </Label>
                </div>
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

