
import React from 'react';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { FormField, FormItem } from '@/components/ui/form';

interface BidRequestCategorySelectorProps {
  form: UseFormReturn<any>;
}

const BidRequestCategorySelector: React.FC<BidRequestCategorySelectorProps> = ({ form }) => {
  const categories = [
    {
      label: 'Roofing',
      value: 'roofing',
    },
    {
      label: 'Power Washing',
      value: 'power-washing',
    },
    {
      label: 'Regular Maintenance',
      value: 'regular-maintenance',
    },
    {
      label: 'Renovation Project',
      value: 'renovation-project',
    },
    {
      label: 'Repair Work',
      value: 'repair-work',
    },
    {
      label: 'Reserve Study',
      value: 'reserve-study',
    },
    {
      label: 'Roof Repair / Replacement',
      value: 'roof-repair-replacement',
    },
    {
      label: 'Signs',
      value: 'signs',
    },
    {
      label: 'Sports Courts',
      value: 'sports-courts',
    },
    {
      label: 'Street Repairs / Paving / Striping',
      value: 'street-repairs-paving-striping',
    },
    {
      label: 'Stucco',
      value: 'stucco',
    },
    {
      label: 'Towing',
      value: 'towing',
    },
    {
      label: 'Trash Disposal',
      value: 'trash-disposal',
    },
    {
      label: 'Trash Services',
      value: 'trash-services',
    },
    {
      label: 'Welder',
      value: 'welder',
    },
    {
      label: 'Window Services',
      value: 'window-services',
    },
  ];

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category.value} onClick={() => field.onChange(category.value)}>
                <div 
                  className={`bg-muted rounded-md aspect-video mb-2 overflow-hidden cursor-pointer border-2 transition-colors ${field.value === category.value ? 'border-primary' : 'border-transparent'}`}
                >
                  {category.value === 'roofing' ? (
                    <img 
                      src="https://cahergndkwfqltxyikyr.supabase.co/storage/v1/object/public/bidrequest-images//roofer.jpg" 
                      alt={category.label} 
                      className="w-full h-full object-cover"
                    />
                  ) : category.value === 'power-washing' ? (
                    <img 
                      src="https://cahergndkwfqltxyikyr.supabase.co/storage/v1/object/public/bidrequest-images//pressure-washing-pavestone.jpg"
                      alt={category.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="/assets/images/placeholder-project.jpg"
                      alt={category.label}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <p className={`text-sm text-center ${field.value === category.value ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                  {category.label}
                </p>
              </div>
            ))}
          </div>
        </FormItem>
      )}
    />
  );
};

export default BidRequestCategorySelector;
