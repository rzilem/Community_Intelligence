
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { statuses } from '../AssociationEditDialog';

interface Props {
  control: any;
}

const AssociationFormSectionPropertyInfo: React.FC<Props> = ({ control }) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="property_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Type</FormLabel>
            <FormControl>
              <Input placeholder="e.g., HOA, Condo, Apartment" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="total_units"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Units</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Number of units"
                {...field}
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
    <div className="grid grid-cols-2 gap-4 mt-4">
      <FormField
        control={control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website</FormLabel>
            <FormControl>
              <Input placeholder="Website URL" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <FormControl>
              <select
                className="w-full border rounded px-2 py-1"
                {...field}
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value || undefined)}
              >
                <option value="">Select status</option>
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </>
);

export default AssociationFormSectionPropertyInfo;
