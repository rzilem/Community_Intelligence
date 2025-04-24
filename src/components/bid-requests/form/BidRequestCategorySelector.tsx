import React from 'react';
import { Button } from '@/components/ui/button';

const BidRequestCategorySelector = () => {
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
    <div>
      {categories.map((category) => (
        <div key={category.value}>
          <div className="bg-muted rounded-md aspect-video mb-3 overflow-hidden">
            {category.value === 'roofing' ? (
              <img 
                src="https://cahergndkwfqltxyikyr.supabase.co/storage/v1/object/public/bidrequest-images//roofer.jpg" 
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
        </div>
      ))}
    </div>
  );
};

export default BidRequestCategorySelector;
