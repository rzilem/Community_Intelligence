
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserPreferences, fetchUserSettings } from '@/services/user/profile-service';
import { toast } from 'sonner';
import { UserSettings } from '@/types/profile-types';

// Expanded preferences schema for more granular control, matching ResidentPreferencesForm pattern.
const preferencesFormSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  notifications_enabled: z.boolean().default(true),
  email_notifications_enabled: z.boolean().default(true),
});

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

interface UserPreferencesFormProps {
  userId: string;
}

const UserPreferencesForm: React.FC<UserPreferencesFormProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      theme: 'system',
      notifications_enabled: true,
      email_notifications_enabled: true,
    },
  });

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        const result = await fetchUserSettings(userId);

        if (result.data) {
          form.reset({
            theme: (result.data.theme || 'system') as 'system' | 'light' | 'dark',
            notifications_enabled: result.data.notifications_enabled !== false,
            email_notifications_enabled:
              result.data.email_notifications_enabled !== false,
          });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadPreferences();
    }
  }, [userId, form]);

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: PreferencesFormValues) => {
    try {
      const result = await updateUserPreferences(userId, values as Partial<UserSettings>);

      if (result.success) {
        toast.success('Preferences updated successfully');
      } else {
        toast.error(`Failed to update preferences: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading preferences...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme Preference</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="system">System Default</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose your preferred theme for the application.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notifications_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel className="text-base">Enable Notifications</FormLabel>
                <FormDescription>
                  Turn on/off all in-app and push notifications.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email_notifications_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel className="text-base">Email Notifications</FormLabel>
                <FormDescription>
                  Receive important updates and communications via email.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserPreferencesForm;

