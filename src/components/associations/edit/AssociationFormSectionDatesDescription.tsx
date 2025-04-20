
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface Props {
  control: any;
}

const AssociationFormSectionDatesDescription: React.FC<Props> = ({ control }) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="insurance_expiration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Insurance Expiration</FormLabel>
            <FormControl>
              <Input
                placeholder="YYYY-MM-DD or custom"
                {...field}
                type="text"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="fire_inspection_due"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fire Inspection Due</FormLabel>
            <FormControl>
              <Input
                placeholder="YYYY-MM-DD or custom"
                {...field}
                type="text"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
    <FormField
      control={control}
      name="founded_date"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Founded Date</FormLabel>
          <FormControl>
            <Input placeholder="YYYY-MM-DD or year" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Input placeholder="Description or notes" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

export default AssociationFormSectionDatesDescription;
