
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ResaleOrderFormData } from '@/hooks/resale/useResaleOrderForm';

interface ContactStepProps {
  form: UseFormReturn<ResaleOrderFormData>;
}

export const ContactStep = ({ form }: ContactStepProps) => {
  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="contactInfo.role"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Your Role</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="title-company" id="title-company" />
                    <Label htmlFor="title-company">Title Company</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="real-estate-agent" id="real-estate-agent" />
                    <Label htmlFor="real-estate-agent">Real Estate Agent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="law-office" id="law-office" />
                    <Label htmlFor="law-office">Law Office</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactInfo.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your full name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contactInfo.company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your company name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactInfo.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Your email address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contactInfo.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your phone number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  );
};
