import React, { useState } from "react";
import { Association } from "@/types/association-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Calendar, Percent, Clock, Bell, MessageSquare, AlarmClock, CreditCard, FileText, Building, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AssociationSettingsTabProps {
  association: Association;
  onSave: (data: Partial<Association>) => Promise<void>;
  saving?: boolean;
}

export const AssociationSettingsTab: React.FC<AssociationSettingsTabProps> = ({
  association,
  onSave,
  saving = false
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState({
    // General Information
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
    // Assessment Settings
    payment_due_day: association.payment_due_day ?? '',
    late_fee_percentage: association.late_fee_percentage ?? '',
    grace_period_days: association.grace_period_days ?? '',
    // Communication Preferences
    email_notifications: association.email_notifications ?? false,
    sms_notifications: association.sms_notifications ?? false,
    auto_reminders: association.auto_reminders ?? false,
    // ACH Settings
    ach_auto_draft_day: association.ach_auto_draft_day ?? "",
    ach_generate_in_advance: association.ach_generate_in_advance !== null && association.ach_generate_in_advance !== undefined ? String(association.ach_generate_in_advance) : "",
    ach_draft_amount: association.ach_draft_amount ?? "full",
    ach_include_charges: association.ach_include_charges ?? "yes",
    // ARC Settings
    arc_model: association.arc_model ?? "standard",
    additional_arc_models: association.additional_arc_models ? typeof association.additional_arc_models === 'string' ? association.additional_arc_models : JSON.stringify(association.additional_arc_models) : "",
    require_arc_voting: association.require_arc_voting ?? false,
    approval_threshold: association.approval_threshold !== null && association.approval_threshold !== undefined ? String(association.approval_threshold) : "50",
    decline_threshold: association.decline_threshold !== null && association.decline_threshold !== undefined ? String(association.decline_threshold) : "50",
    arc_name: association.arc_name ?? "Architectural Review Committee",
    // Collections Settings
    collections_active: association.collections_active ?? "yes",
    collections_model: association.collections_model ?? "standard",
    processing_days: association.processing_days ?? "30",
    additional_collections_models: association.additional_collections_models ? typeof association.additional_collections_models === 'string' ? association.additional_collections_models : JSON.stringify(association.additional_collections_models) : "",
    minimum_balance: association.minimum_balance !== null && association.minimum_balance !== undefined ? String(association.minimum_balance) : "100",
    age_of_balance: association.age_of_balance ?? "90",
    balance_threshold_type: association.balance_threshold_type ?? "amount",
    balance_threshold: association.balance_threshold ?? "100",
    lien_threshold_type: association.lien_threshold_type ?? "amount",
    lien_threshold: association.lien_threshold ?? "500",
    new_association_grace_period: association.new_association_grace_period ?? "60",
    new_owner_grace_period: association.new_owner_grace_period ?? "30",
    board_approval_required: association.board_approval_required ?? false,
    // Statement Settings
    association_address_setting: association.association_address_setting ?? "association",
    statement_format: association.statement_format ?? "standard",
    remittance_coupon_message: association.remittance_coupon_message ?? "",
    utilities_billing_message: association.utilities_billing_message ?? "",
    include_block_ledger_accounts: association.include_block_ledger_accounts ?? false,
    include_ach_default: association.include_ach_default ?? false,
    include_all_properties_default: association.include_all_properties_default ?? false,
    include_credit_balances_default: association.include_credit_balances_default ?? false,
    include_qr_code: association.include_qr_code ?? false,
    // Miscellaneous
    association_time_zone: association.association_time_zone ?? "America/New_York"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (field: string, value: boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedData: Partial<Association> = {
        ...form,
        email_notifications: !!form.email_notifications,
        sms_notifications: !!form.sms_notifications,
        auto_reminders: !!form.auto_reminders,
      };
      await onSave(formattedData);
      toast.success("Association settings updated successfully");
    } catch (err: any) {
      console.error("Error saving association settings:", err);
      toast.error(err.message || "Failed to update settings");
    }
  };

  const timezoneOptions = [{
    value: "America/New_York",
    label: "Eastern Time (ET)"
  }, {
    value: "America/Chicago",
    label: "Central Time (CT)"
  }, {
    value: "America/Denver",
    label: "Mountain Time (MT)"
  }, {
    value: "America/Los_Angeles",
    label: "Pacific Time (PT)"
  }, {
    value: "America/Anchorage",
    label: "Alaska Time (AK)"
  }, {
    value: "Pacific/Honolulu",
    label: "Hawaii Time (HI)"
  }];

  const propertyTypeOptions = [{
    value: "condominium",
    label: "Condominium"
  }, {
    value: "townhouse",
    label: "Townhouse"
  }, {
    value: "single-family",
    label: "Single-Family Homes"
  }, {
    value: "mixed",
    label: "Mixed Use"
  }, {
    value: "apartment",
    label: "Apartment"
  }, {
    value: "commercial",
    label: "Commercial"
  }];

  const arcModelOptions = [{
    value: "standard",
    label: "Standard"
  }, {
    value: "committee",
    label: "Committee"
  }, {
    value: "board",
    label: "Board"
  }, {
    value: "hybrid",
    label: "Hybrid"
  }, {
    value: "custom",
    label: "Custom"
  }];

  const collectionsModelOptions = [{
    value: "standard",
    label: "Standard"
  }, {
    value: "aggressive",
    label: "Aggressive"
  }, {
    value: "conservative",
    label: "Conservative"
  }, {
    value: "custom",
    label: "Custom"
  }];

  const statementFormatOptions = [{
    value: "standard",
    label: "Standard"
  }, {
    value: "detailed",
    label: "Detailed"
  }, {
    value: "summary",
    label: "Summary"
  }, {
    value: "custom",
    label: "Custom"
  }];

  const addressSettingOptions = [{
    value: "association",
    label: "Association Address"
  }, {
    value: "management",
    label: "Management Company"
  }, {
    value: "custom",
    label: "Custom"
  }];

  const thresholdTypeOptions = [{
    value: "amount",
    label: "Fixed Amount"
  }, {
    value: "percentage",
    label: "Percentage"
  }, {
    value: "months",
    label: "Months of Assessments"
  }];

  const draftAmountOptions = [{
    value: "full",
    label: "Full Balance"
  }, {
    value: "assessment",
    label: "Assessment Only"
  }, {
    value: "custom",
    label: "Custom Amount"
  }];

  return (
    <div className="w-full">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <h2 className="text-2xl font-bold p-6">Association Settings</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex justify-between w-full border-b rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="general" 
                className="flex-1 rounded-none border-b-2 border-transparent px-8 py-4 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-primary transition-colors"
              >
                General
              </TabsTrigger>
              <TabsTrigger 
                value="assessments" 
                className="flex-1 rounded-none border-b-2 border-transparent px-8 py-4 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-primary transition-colors"
              >
                Assessments
              </TabsTrigger>
              <TabsTrigger 
                value="communication" 
                className="flex-1 rounded-none border-b-2 border-transparent px-8 py-4 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-primary transition-colors"
              >
                Communication
              </TabsTrigger>
              <TabsTrigger 
                value="ach" 
                className="flex-1 rounded-none border-b-2 border-transparent px-8 py-4 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-primary transition-colors"
              >
                ACH
              </TabsTrigger>
              <TabsTrigger 
                value="arc" 
                className="flex-1 rounded-none border-b-2 border-transparent px-8 py-4 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-primary transition-colors"
              >
                ARC
              </TabsTrigger>
              <TabsTrigger 
                value="collections" 
                className="flex-1 rounded-none border-b-2 border-transparent px-8 py-4 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-primary transition-colors"
              >
                Collections
              </TabsTrigger>
              <TabsTrigger 
                value="statements" 
                className="flex-1 rounded-none border-b-2 border-transparent px-8 py-4 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-primary transition-colors"
              >
                Statements
              </TabsTrigger>
              <TabsTrigger 
                value="misc" 
                className="flex-1 rounded-none border-b-2 border-transparent px-8 py-4 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-primary transition-colors"
              >
                Misc
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* General Information Tab */}
              <TabsContent value="general" className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Association Name</Label>
                    <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Enter association name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input id="contact_email" name="contact_email" type="email" value={form.contact_email} onChange={handleChange} placeholder="Enter contact email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Enter phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" value={form.website} onChange={handleChange} placeholder="Enter website URL" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="Enter street address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={form.city} onChange={handleChange} placeholder="Enter city" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={form.state} onChange={handleChange} placeholder="Enter state" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">Zip</Label>
                    <Input id="zip" name="zip" value={form.zip} onChange={handleChange} placeholder="Enter zip code" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Brand Color</Label>
                    <div className="flex gap-2">
                      <Input id="primary_color" name="primary_color" type="color" value={form.primary_color} onChange={handleChange} className="w-16 p-1 h-10" />
                      <Input name="primary_color" value={form.primary_color} onChange={handleChange} placeholder="Enter primary color hex code" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Brand Color</Label>
                    <div className="flex gap-2">
                      <Input id="secondary_color" name="secondary_color" type="color" value={form.secondary_color} onChange={handleChange} className="w-16 p-1 h-10" />
                      <Input name="secondary_color" value={form.secondary_color} onChange={handleChange} placeholder="Enter secondary color hex code" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founded_date">Founded Date</Label>
                    <Input id="founded_date" name="founded_date" type="date" value={form.founded_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurance_expiration">Insurance Expiration</Label>
                    <Input id="insurance_expiration" name="insurance_expiration" type="date" value={form.insurance_expiration} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fire_inspection_due">Fire Inspection Due</Label>
                    <Input id="fire_inspection_due" name="fire_inspection_due" type="date" value={form.fire_inspection_due} onChange={handleChange} />
                  </div>
                </div>
              </TabsContent>
              
              {/* Assessment Settings Tab */}
              <TabsContent value="assessments" className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Assessment Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <Label htmlFor="payment_due_day" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      Payment Due Day
                    </Label>
                    <Input id="payment_due_day" name="payment_due_day" type="number" min={1} max={31} value={form.payment_due_day} onChange={handleChange} placeholder="e.g. 1 (first day of month)" />
                    <span className="text-xs text-muted-foreground">
                      The day of the month assessments are due.
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="late_fee_percentage" className="flex items-center gap-1">
                      <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                      Late Fee (%)
                    </Label>
                    <Input id="late_fee_percentage" name="late_fee_percentage" type="number" step={0.01} min={0} value={form.late_fee_percentage} onChange={handleChange} placeholder="e.g. 5 (%)" />
                    <span className="text-xs text-muted-foreground">
                      The percentage charged as a late fee.
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="grace_period_days" className="flex items-center gap-1">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      Grace Period (Days)
                    </Label>
                    <Input id="grace_period_days" name="grace_period_days" type="number" min={0} value={form.grace_period_days} onChange={handleChange} placeholder="e.g. 10" />
                    <span className="text-xs text-muted-foreground">
                      Number of days after due date before a late fee applies.
                    </span>
                  </div>
                </div>
              </TabsContent>
              
              {/* Communication Preferences Tab */}
              <TabsContent value="communication" className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Communication Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-center space-x-3">
                    <Switch id="email_notifications" checked={!!form.email_notifications} onCheckedChange={checked => handleSwitchChange("email_notifications", !!checked)} />
                    <Label htmlFor="email_notifications" className="flex items-center gap-1 cursor-pointer">
                      <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                      Email Notifications
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch id="sms_notifications" checked={!!form.sms_notifications} onCheckedChange={checked => handleSwitchChange("sms_notifications", !!checked)} />
                    <Label htmlFor="sms_notifications" className="flex items-center gap-1 cursor-pointer">
                      <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                      SMS Notifications
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch id="auto_reminders" checked={!!form.auto_reminders} onCheckedChange={checked => handleSwitchChange("auto_reminders", !!checked)} />
                    <Label htmlFor="auto_reminders" className="flex items-center gap-1 cursor-pointer">
                      <AlarmClock className="h-4 w-4 mr-2 text-muted-foreground" />
                      Auto-Reminders
                    </Label>
                  </div>
                </div>
              </TabsContent>
              
              {/* ACH Settings Tab */}
              <TabsContent value="ach" className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">
                  <CreditCard className="h-5 w-5 inline-block mr-2" /> 
                  ACH Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ach_auto_draft_day">Auto-Draft Day</Label>
                    <Input id="ach_auto_draft_day" name="ach_auto_draft_day" type="number" min={1} max={31} value={form.ach_auto_draft_day} onChange={handleChange} placeholder="e.g. 5 (fifth day of month)" />
                    <span className="text-xs text-muted-foreground">
                      Day of the month when funds are automatically withdrawn.
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ach_generate_in_advance">Generate In Advance (days)</Label>
                    <Input id="ach_generate_in_advance" name="ach_generate_in_advance" type="number" min={0} value={form.ach_generate_in_advance} onChange={handleChange} placeholder="e.g. 3" />
                    <span className="text-xs text-muted-foreground">
                      Days ahead of draft date to generate the ACH file.
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ach_draft_amount">Draft Amount</Label>
                    <Select value={form.ach_draft_amount} onValueChange={value => handleSelectChange("ach_draft_amount", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select draft amount option" />
                      </SelectTrigger>
                      <SelectContent>
                        {draftAmountOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">
                      Determines what amount is drafted from accounts.
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ach_include_charges">Include Charges</Label>
                    <Select value={form.ach_include_charges} onValueChange={value => handleSelectChange("ach_include_charges", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Include charges?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">
                      Whether to include additional charges in the ACH draft.
                    </span>
                  </div>
                </div>
              </TabsContent>
              
              {/* ARC Settings Tab */}
              <TabsContent value="arc" className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">
                  <Building className="h-5 w-5 inline-block mr-2" /> 
                  Architectural Review Committee Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="arc_name">Committee Name</Label>
                    <Input id="arc_name" name="arc_name" value={form.arc_name} onChange={handleChange} placeholder="e.g. Architectural Review Committee" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arc_model">ARC Model</Label>
                    <Select value={form.arc_model} onValueChange={value => handleSelectChange("arc_model", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ARC model" />
                      </SelectTrigger>
                      <SelectContent>
                        {arcModelOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex items-center">
                    <Switch id="require_arc_voting" checked={!!form.require_arc_voting} onCheckedChange={checked => handleSwitchChange("require_arc_voting", !!checked)} />
                    <Label htmlFor="require_arc_voting" className="ml-2">
                      Require ARC Voting
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approval_threshold">Approval Threshold (%)</Label>
                    <Input id="approval_threshold" name="approval_threshold" type="number" min={0} max={100} value={form.approval_threshold} onChange={handleChange} placeholder="e.g. 50" />
                    <span className="text-xs text-muted-foreground">
                      Percentage of votes needed for approval.
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decline_threshold">Decline Threshold (%)</Label>
                    <Input id="decline_threshold" name="decline_threshold" type="number" min={0} max={100} value={form.decline_threshold} onChange={handleChange} placeholder="e.g. 50" />
                    <span className="text-xs text-muted-foreground">
                      Percentage of votes needed for rejection.
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additional_arc_models">Additional ARC Models (JSON)</Label>
                    <Input id="additional_arc_models" name="additional_arc_models" value={form.additional_arc_models} onChange={handleChange} placeholder='e.g. ["Architectural", "Landscape"]' />
                    <span className="text-xs text-muted-foreground">
                      JSON array of additional ARC models.
                    </span>
                  </div>
                </div>
              </TabsContent>
              
              {/* Collections Settings Tab */}
              <TabsContent value="collections" className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">
                  <Shield className="h-5 w-5 inline-block mr-2" /> 
                  Collections Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="collections_active">Collections Active</Label>
                    <Select value={form.collections_active} onValueChange={value => handleSelectChange("collections_active", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Collections active?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collections_model">Collections Model</Label>
                    <Select value={form.collections_model} onValueChange={value => handleSelectChange("collections_model", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select collections model" />
                      </SelectTrigger>
                      <SelectContent>
                        {collectionsModelOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="processing_days">Processing Days</Label>
                    <Input id="processing_days" name="processing_days" type="number" min={0} value={form.processing_days} onChange={handleChange} placeholder="e.g. 30" />
                    <span className="text-xs text-muted-foreground">
                      Days to process collections actions.
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimum_balance">Minimum Balance</Label>
                    <Input id="minimum_balance" name="minimum_balance" type="number" min={0} step={0.01} value={form.minimum_balance} onChange={handleChange} placeholder="e.g. 100" />
                    <span className="text-xs text-muted-foreground">
                      Minimum balance to trigger collections.
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age_of_balance">Age of Balance (days)</Label>
                    <Input id="age_of_balance" name="age_of_balance" type="number" min={0} value={form.age_of_balance} onChange={handleChange} placeholder="e.g. 90" />
                    <span className="text-xs text-muted-foreground">
                      Minimum age of balance in days.
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="balance_threshold_type">Balance Threshold Type</Label>
                    <Select value={form.balance_threshold_type} onValueChange={value => handleSelectChange("balance_threshold_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select threshold type" />
                      </SelectTrigger>
                      <SelectContent>
                        {thresholdTypeOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="balance_threshold">Balance Threshold</Label>
                    <Input id="balance_threshold" name="balance_threshold" value={form.balance_threshold} onChange={handleChange} placeholder="Balance threshold value" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lien_threshold_type">Lien Threshold Type</Label>
                    <Select value={form.lien_threshold_type} onValueChange={value => handleSelectChange("lien_threshold_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select threshold type" />
                      </SelectTrigger>
                      <SelectContent>
                        {thresholdTypeOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lien_threshold">Lien Threshold</Label>
                    <Input id="lien_threshold" name="lien_threshold" value={form.lien_threshold} onChange={handleChange} placeholder="Lien threshold value" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_association_grace_period">New Association Grace Period (days)</Label>
                    <Input id="new_association_grace_period" name="new_association_grace_period" type="number" min={0} value={form.new_association_grace_period} onChange={handleChange} placeholder="e.g. 60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_owner_grace_period">New Owner Grace Period (days)</Label>
                    <Input id="new_owner_grace_period" name="new_owner_grace_period" type="number" min={0} value={form.new_owner_grace_period} onChange={handleChange} placeholder="e.g. 30" />
                  </div>
                  <div className="space-y-2 flex items-center">
                    <Switch id="board_approval_required" checked={!!form.board_approval_required} onCheckedChange={checked => handleSwitchChange("board_approval_required", !!checked)} />
                    <Label htmlFor="board_approval_required" className="ml-2">
                      Board Approval Required
                    </Label>
                  </div>
                </div>
              </TabsContent>
              
              {/* Statements Settings Tab */}
              <TabsContent value="statements" className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">
                  <FileText className="h-5 w-5 inline-block mr-2" /> 
                  Statements Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="association_address_setting">Association Address Setting</Label>
                    <Select value={form.association_address_setting} onValueChange={value => handleSelectChange("association_address_setting", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select address setting" />
                      </SelectTrigger>
                      <SelectContent>
                        {addressSettingOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statement_format">Statement Format</Label>
                    <Select value={form.statement_format} onValueChange={value => handleSelectChange("statement_format", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select statement format" />
                      </SelectTrigger>
                      <SelectContent>
                        {statementFormatOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="remittance_coupon_message">Remittance Coupon Message</Label>
                    <Input id="remittance_coupon_message" name="remittance_coupon_message" value={form.remittance_coupon_message} onChange={handleChange} placeholder="Message to display on remittance coupons" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="utilities_billing_message">Utilities Billing Message</Label>
                    <Input id="utilities_billing_message" name="utilities_billing_message" value={form.utilities_billing_message} onChange={handleChange} placeholder="Message for utilities billing" />
                  </div>
                  <div className="space-y-2 flex items-center">
                    <Switch id="include_block_ledger_accounts" checked={!!form.include_block_ledger_accounts} onCheckedChange={checked => handleSwitchChange("include_block_ledger_accounts", !!checked)} />
                    <Label htmlFor="include_block_ledger_accounts" className="ml-2">
                      Include Block Ledger Accounts
                    </Label>
                  </div>
                  <div className="space-y-2 flex items-center">
                    <Switch id="include_ach_default" checked={!!form.include_ach_default} onCheckedChange={checked => handleSwitchChange("include_ach_default", !!checked)} />
                    <Label htmlFor="include_ach_default" className="ml-2">
                      Include ACH Default
                    </Label>
                  </div>
                  <div className="space-y-2 flex items-center">
                    <Switch id="include_all_properties_default" checked={!!form.include_all_properties_default} onCheckedChange={checked => handleSwitchChange("include_all_properties_default", !!checked)} />
                    <Label htmlFor="include_all_properties_default" className="ml-2">
                      Include All Properties Default
                    </Label>
                  </div>
                  <div className="space-y-2 flex items-center">
                    <Switch id="include_credit_balances_default" checked={!!form.include_credit_balances_default} onCheckedChange={checked => handleSwitchChange("include_credit_balances_default", !!checked)} />
                    <Label htmlFor="include_credit_balances_default" className="ml-2">
                      Include Credit Balances Default
                    </Label>
                  </div>
                  <div className="space-y-2 flex items-center">
                    <Switch id="include_qr_code" checked={!!form.include_qr_code} onCheckedChange={checked => handleSwitchChange("include_qr_code", !!checked)} />
                    <Label htmlFor="include_qr_code" className="ml-2">
                      Include QR Code
                    </Label>
                  </div>
                </div>
              </TabsContent>
              
              {/* Miscellaneous Settings Tab */}
              <TabsContent value="misc" className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Miscellaneous Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="association_time_zone">Association Time Zone</Label>
                    <Select value={form.association_time_zone} onValueChange={value => handleSelectChange("association_time_zone", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezoneOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <div className="mt-8 pt-4 border-t">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
                  {saving ? "Saving Settings..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssociationSettingsTab;
