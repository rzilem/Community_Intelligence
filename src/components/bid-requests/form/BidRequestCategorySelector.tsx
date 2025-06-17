
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { CATEGORY_MAPPINGS, getCategoryDisplayName } from '@/constants/category-mappings';

interface BidRequestCategorySelectorProps {
  form: UseFormReturn<Partial<BidRequestWithVendors>>;
}

const BidRequestCategorySelector: React.FC<BidRequestCategorySelectorProps> = ({ form }) => {
  const { setValue, watch } = form;
  const selectedCategory = watch('category');

  const handleCategorySelect = (categoryValue: string) => {
    setValue('category', categoryValue, { shouldValidate: true });
  };

  return (
    <FormItem className="space-y-4">
      <FormLabel>Project Category</FormLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
        {CATEGORY_MAPPINGS.map((mapping) => (
          <Card 
            key={mapping.bidRequestCategory}
            className={`cursor-pointer hover:shadow-md transition-all border-2 ${
              selectedCategory === mapping.bidRequestCategory ? 'border-primary' : 'border-transparent'
            }`}
            onClick={() => handleCategorySelect(mapping.bidRequestCategory)}
          >
            <div className="p-4 flex flex-col h-full">
              <div className="bg-muted rounded-md aspect-video mb-3 overflow-hidden flex items-center justify-center">
                <div className="text-4xl text-muted-foreground">
                  {mapping.bidRequestCategory === 'hvac' && '🌡️'}
                  {mapping.bidRequestCategory === 'plumbing' && '🔧'}
                  {mapping.bidRequestCategory === 'electrical' && '⚡'}
                  {mapping.bidRequestCategory === 'landscaping' && '🌱'}
                  {mapping.bidRequestCategory === 'painting' && '🎨'}
                  {mapping.bidRequestCategory === 'roofing' && '🏠'}
                  {mapping.bidRequestCategory === 'security' && '🔒'}
                  {mapping.bidRequestCategory === 'construction' && '🏗️'}
                  {mapping.bidRequestCategory === 'cleaning' && '🧹'}
                  {!['hvac', 'plumbing', 'electrical', 'landscaping', 'painting', 'roofing', 'security', 'construction', 'cleaning'].includes(mapping.bidRequestCategory) && '🔧'}
                </div>
              </div>
              <h3 className="font-medium text-base">{mapping.displayName}</h3>
              <p className="text-xs text-muted-foreground mt-1">{mapping.description}</p>
              <div className="mt-2">
                <p className="text-xs text-blue-600">
                  Matches: {mapping.vendorSpecialties.join(', ')}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </FormItem>
  );
};

export default BidRequestCategorySelector;
