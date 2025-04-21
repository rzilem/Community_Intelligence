import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Association } from '@/types/association-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface AssociationSettingsTabProps {
  association: Association;
  onSave: (data: Partial<Association>) => Promise<void>;
  saving: boolean;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Association name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  contact_email: z.string().email().optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  email_notifications: z.boolean().default(false).optional(),
  sms_notifications: z.boolean().default(false).optional(),
  auto_reminders: z.boolean().default(false).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AssociationSettingsTab = ({ association, onSave, saving }: AssociationSettingsTabProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: association.name || "",
      description: association.description || "",
      address: association.address || "",
      city: association.city || "",
      state: association.state || "",
      zip: association.zip || "",
      contact_email: association.contact_email || "",
      website: association.website || "",
      phone: association.phone || "",
      country: association.country || "",
      primary_color: association.primary_color || "",
      secondary_color: association.secondary_color || "",
      email_notifications: association.email_notifications || false,
      sms_notifications: association.sms_notifications || false,
      auto_reminders: association.auto_reminders || false,
    },
    mode: "onChange",
  })

  const onSubmit = async (data: FormValues) => {
    await onSave(data);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full max-w-6xl flex flex-nowrap border-b rounded-none bg-transparent p-0 h-auto overflow-x-auto scrollbar-hide">
          <TabsTrigger 
            value="general" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium tracking-tight whitespace-nowrap data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            General
          </TabsTrigger>
          <TabsTrigger 
            value="payment" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium tracking-tight whitespace-nowrap data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            Payment Settings
          </TabsTrigger>
          <TabsTrigger 
            value="collections" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium tracking-tight whitespace-nowrap data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            Collections
          </TabsTrigger>
          <TabsTrigger 
            value="arc" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium tracking-tight whitespace-nowrap data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            ARC Settings
          </TabsTrigger>
          <TabsTrigger 
            value="statements" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium tracking-tight whitespace-nowrap data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            Statement Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Association Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Association Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Zip Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="Website" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="primary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Primary Color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="secondary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Secondary Color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="email_notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Email Notifications</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sms_notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>SMS Notifications</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="auto_reminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Auto Reminders</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="payment">
          <div>Payment Settings Content</div>
        </TabsContent>

        <TabsContent value="collections">
          <div>Collections Content</div>
        </TabsContent>

        <TabsContent value="arc">
          <div>ARC Settings Content</div>
        </TabsContent>

        <TabsContent value="statements">
          <div>Statement Settings Content</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssociationSettingsTab;
