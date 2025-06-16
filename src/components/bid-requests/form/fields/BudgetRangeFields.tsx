
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BidRequestFormData } from '../../types/bid-request-form-types';

interface BudgetRangeFieldsProps {
  form: UseFormReturn<BidRequestFormData>;
}

const BudgetRangeFields: React.FC<BudgetRangeFieldsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="budget_range_min"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Budget ($)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="budget_range_max"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Budget ($)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BudgetRangeFields;
