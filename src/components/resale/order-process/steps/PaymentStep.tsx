
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ResaleOrderFormData } from '@/hooks/resale/useResaleOrderForm';

interface PaymentStepProps {
  form: UseFormReturn<ResaleOrderFormData>;
}

export const PaymentStep = ({ form }: PaymentStepProps) => {
  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="payment.cardName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name on Card</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter the name on your card"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment.cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your card number"
                  maxLength={16}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="payment.expiration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Date</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment.cvv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CVV</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    maxLength={4}
                    placeholder="Enter CVV"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="payment.billingZip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Zip Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter billing zip code"
                  maxLength={5}
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
