
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
  // Include every property, defaulting undefined or null to empty string/false/0 as appropriate
  const [form, setForm] = useState({
    // Main/general
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
    // Assessment basic
    payment_due_day: association.payment_due_day ?? "",
    late_fee_percentage: association.late_fee_percentage ?? "",
    grace_period_days: association.grace_period_days ?? "",
    email_notifications: association.email_notifications ?? false,
    sms_notifications: association.sms_notifications ?? false,
    auto_reminders: association.auto_reminders ?? false,
    // --- ACH Settings ---
    ach_auto_draft_day: association.ach_auto_draft_day ?? "",
    ach_generate_in_advance: association.ach_generate_in_advance ?? "",
    ach_draft_amount: association.ach_draft_amount ?? "",
    ach_include_charges: association.ach_include_charges ?? "",
    // --- ARC Settings ---
    arc_model: association.arc_model ?? "",
    additional_arc_models: association.additional_arc_models ?? "",
    require_arc_voting: association.require_arc_voting ?? false,
    approval_threshold: association.approval_threshold ?? "",
    decline_threshold: association.decline_threshold ?? "",
    arc_name: association.arc_name ?? "",
    // --- Collections Settings ---
    collections_active: association.collections_active ?? "",
    collections_model: association.collections_model ?? "",
    processing_days: association.processing_days ?? "",
    additional_collections_models: association.additional_collections_models ?? "",
    minimum_balance: association.minimum_balance ?? "",
    age_of_balance: association.age_of_balance ?? "",
    balance_threshold_type: association.balance_threshold_type ?? "",
    balance_threshold: association.balance_threshold ?? "",
    lien_threshold_type: association.lien_threshold_type ?? "",
    lien_threshold: association.lien_threshold ?? "",
    new_association_grace_period: association.new_association_grace_period ?? "",
    new_owner_grace_period: association.new_owner_grace_period ?? "",
    board_approval_required: association.board_approval_required ?? false,
    // --- Statements Settings ---
    association_address_setting: association.association_address_setting ?? "",
    statement_format: association.statement_format ?? "",
    remittance_coupon_message: association.remittance_coupon_message ?? "",
    utilities_billing_message: association.utilities_billing_message ?? "",
    include_block_ledger_accounts: association.include_block_ledger_accounts ?? false,
    include_ach_default: association.include_ach_default ?? false,
    include_all_properties_default: association.include_all_properties_default ?? false,
    include_credit_balances_default: association.include_credit_balances_default ?? false,
    include_qr_code: association.include_qr_code ?? false,
    // --- Miscellaneous ---
    association_time_zone: association.association_time_zone ?? "",
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
                    style={{ backgroundColor: form.primary_color || "#fff" }}
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
                    style={{ backgroundColor: form.secondary_color || "#fff" }}
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

            {/* Divider */}
            <hr className="my-8 border-t border-muted" />

            {/* ACH Settings Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">ACH Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="ach_auto_draft_day">Auto-Draft Day</Label>
                  <Input
                    id="ach_auto_draft_day"
                    name="ach_auto_draft_day"
                    value={form.ach_auto_draft_day}
                    onChange={handleChange}
                    placeholder="e.g. 5 (fifth day of month)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ach_generate_in_advance">Generate In Advance (days)</Label>
                  <Input
                    id="ach_generate_in_advance"
                    name="ach_generate_in_advance"
                    type="number"
                    min={0}
                    value={form.ach_generate_in_advance}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ach_draft_amount">Draft Amount</Label>
                  <Input
                    id="ach_draft_amount"
                    name="ach_draft_amount"
                    value={form.ach_draft_amount}
                    onChange={handleChange}
                    placeholder="e.g. full, partial, $amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ach_include_charges">Include Charges</Label>
                  <Input
                    id="ach_include_charges"
                    name="ach_include_charges"
                    value={form.ach_include_charges}
                    onChange={handleChange}
                    placeholder="e.g. yes, no"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-8 border-t border-muted" />

            {/* ARC Settings Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">ARC Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="arc_model">ARC Model</Label>
                  <Input
                    id="arc_model"
                    name="arc_model"
                    value={form.arc_model}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arc_name">ARC Name</Label>
                  <Input
                    id="arc_name"
                    name="arc_name"
                    value={form.arc_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 flex items-center">
                  <Switch
                    id="require_arc_voting"
                    checked={!!form.require_arc_voting}
                    onCheckedChange={(checked) => handleSwitchChange("require_arc_voting", !!checked)}
                  />
                  <Label htmlFor="require_arc_voting" className="ml-2">
                    Require ARC Voting
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approval_threshold">Approval Threshold (%)</Label>
                  <Input
                    id="approval_threshold"
                    name="approval_threshold"
                    type="number"
                    min={0}
                    value={form.approval_threshold}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decline_threshold">Decline Threshold (%)</Label>
                  <Input
                    id="decline_threshold"
                    name="decline_threshold"
                    type="number"
                    min={0}
                    value={form.decline_threshold}
                    onChange={handleChange}
                  />
                </div>
                {/* JSON fields for additional models */}
                <div className="space-y-2">
                  <Label htmlFor="additional_arc_models">Additional ARC Models (JSON)</Label>
                  <Input
                    id="additional_arc_models"
                    name="additional_arc_models"
                    value={form.additional_arc_models}
                    onChange={handleChange}
                    placeholder='e.g. ["Architectural", "Landscape"]'
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-8 border-t border-muted" />

            {/* Collections Settings Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Collections Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="collections_active">Collections Active</Label>
                  <Input
                    id="collections_active"
                    name="collections_active"
                    value={form.collections_active}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collections_model">Collections Model</Label>
                  <Input
                    id="collections_model"
                    name="collections_model"
                    value={form.collections_model}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processing_days">Processing Days</Label>
                  <Input
                    id="processing_days"
                    name="processing_days"
                    value={form.processing_days}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimum_balance">Minimum Balance</Label>
                  <Input
                    id="minimum_balance"
                    name="minimum_balance"
                    type="number"
                    min={0}
                    value={form.minimum_balance}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age_of_balance">Age of Balance</Label>
                  <Input
                    id="age_of_balance"
                    name="age_of_balance"
                    value={form.age_of_balance}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance_threshold_type">Balance Threshold Type</Label>
                  <Input
                    id="balance_threshold_type"
                    name="balance_threshold_type"
                    value={form.balance_threshold_type}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance_threshold">Balance Threshold</Label>
                  <Input
                    id="balance_threshold"
                    name="balance_threshold"
                    value={form.balance_threshold}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lien_threshold_type">Lien Threshold Type</Label>
                  <Input
                    id="lien_threshold_type"
                    name="lien_threshold_type"
                    value={form.lien_threshold_type}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lien_threshold">Lien Threshold</Label>
                  <Input
                    id="lien_threshold"
                    name="lien_threshold"
                    value={form.lien_threshold}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_association_grace_period">New Association Grace Period</Label>
                  <Input
                    id="new_association_grace_period"
                    name="new_association_grace_period"
                    value={form.new_association_grace_period}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_owner_grace_period">New Owner Grace Period</Label>
                  <Input
                    id="new_owner_grace_period"
                    name="new_owner_grace_period"
                    value={form.new_owner_grace_period}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 flex items-center">
                  <Switch
                    id="board_approval_required"
                    checked={!!form.board_approval_required}
                    onCheckedChange={(checked) => handleSwitchChange("board_approval_required", !!checked)}
                  />
                  <Label htmlFor="board_approval_required" className="ml-2">
                    Board Approval Required
                  </Label>
                </div>
                {/* Extra JSON collections model */}
                <div className="space-y-2">
                  <Label htmlFor="additional_collections_models">Additional Collections Models (JSON)</Label>
                  <Input
                    id="additional_collections_models"
                    name="additional_collections_models"
                    value={form.additional_collections_models}
                    onChange={handleChange}
                    placeholder='e.g. ["ModelA", "ModelB"]'
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-8 border-t border-muted" />

            {/* Statements Settings Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Statements Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="association_address_setting">Association Address Setting</Label>
                  <Input
                    id="association_address_setting"
                    name="association_address_setting"
                    value={form.association_address_setting}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statement_format">Statement Format</Label>
                  <Input
                    id="statement_format"
                    name="statement_format"
                    value={form.statement_format}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remittance_coupon_message">Remittance Coupon Message</Label>
                  <Input
                    id="remittance_coupon_message"
                    name="remittance_coupon_message"
                    value={form.remittance_coupon_message}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utilities_billing_message">Utilities Billing Message</Label>
                  <Input
                    id="utilities_billing_message"
                    name="utilities_billing_message"
                    value={form.utilities_billing_message}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 flex items-center">
                  <Switch
                    id="include_block_ledger_accounts"
                    checked={!!form.include_block_ledger_accounts}
                    onCheckedChange={(checked) => handleSwitchChange("include_block_ledger_accounts", !!checked)}
                  />
                  <Label htmlFor="include_block_ledger_accounts" className="ml-2">
                    Include Block Ledger Accounts
                  </Label>
                </div>
                <div className="space-y-2 flex items-center">
                  <Switch
                    id="include_ach_default"
                    checked={!!form.include_ach_default}
                    onCheckedChange={(checked) => handleSwitchChange("include_ach_default", !!checked)}
                  />
                  <Label htmlFor="include_ach_default" className="ml-2">
                    Include ACH Default
                  </Label>
                </div>
                <div className="space-y-2 flex items-center">
                  <Switch
                    id="include_all_properties_default"
                    checked={!!form.include_all_properties_default}
                    onCheckedChange={(checked) => handleSwitchChange("include_all_properties_default", !!checked)}
                  />
                  <Label htmlFor="include_all_properties_default" className="ml-2">
                    Include All Properties Default
                  </Label>
                </div>
                <div className="space-y-2 flex items-center">
                  <Switch
                    id="include_credit_balances_default"
                    checked={!!form.include_credit_balances_default}
                    onCheckedChange={(checked) => handleSwitchChange("include_credit_balances_default", !!checked)}
                  />
                  <Label htmlFor="include_credit_balances_default" className="ml-2">
                    Include Credit Balances Default
                  </Label>
                </div>
                <div className="space-y-2 flex items-center">
                  <Switch
                    id="include_qr_code"
                    checked={!!form.include_qr_code}
                    onCheckedChange={(checked) => handleSwitchChange("include_qr_code", !!checked)}
                  />
                  <Label htmlFor="include_qr_code" className="ml-2">
                    Include QR Code
                  </Label>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-8 border-t border-muted" />

            {/* Miscellaneous Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Miscellaneous</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="association_time_zone">Association Time Zone</Label>
                  <Input
                    id="association_time_zone"
                    name="association_time_zone"
                    value={form.association_time_zone}
                    onChange={handleChange}
                  />
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
