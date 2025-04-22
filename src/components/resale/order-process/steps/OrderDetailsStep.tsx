
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ResaleOrderFormData } from '@/hooks/resale/useResaleOrderForm';

interface OrderDetailsStepProps {
  form: UseFormReturn<ResaleOrderFormData>;
}

export const OrderDetailsStep = ({ form }: OrderDetailsStepProps) => {
  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="orderDetails.rushOption"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Processing Time</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">Standard Processing (3-5 business days)</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="rush" id="rush" />
                    <Label htmlFor="rush">Rush Processing (1-2 business days) +$100</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="super-rush" id="super-rush" />
                    <Label htmlFor="super-rush">Super Rush Processing (Same day) +$200</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orderDetails.closingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Closing Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orderDetails.additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter any additional information or special requests"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
};
