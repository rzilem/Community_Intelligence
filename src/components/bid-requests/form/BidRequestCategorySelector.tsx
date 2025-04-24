
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { BidRequestWithVendors } from '@/types/bid-request-types';

interface CategoryOption {
  value: string;
  label: string;
  description: string;
  imageUrl?: string;
}

const bidRequestCategories: CategoryOption[] = [
  { 
    value: 'access_system',
    label: 'Access System', 
    description: 'Security and access control systems',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'arborist',
    label: 'Arborist', 
    description: 'Tree care and maintenance services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'concrete',
    label: 'Concrete', 
    description: 'Concrete installation and repair services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'construction',
    label: 'Construction (Big Projects)', 
    description: 'Large-scale construction and renovation projects',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'cpa',
    label: 'CPA', 
    description: 'Certified Public Accountant services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'dog_waste',
    label: 'Dog Waste', 
    description: 'Pet waste removal and management services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'electrical',
    label: 'Electrical', 
    description: 'Wiring, fixtures, and electrical system work',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'elevator_repair',
    label: 'Elevator Repair / Servicing', 
    description: 'Elevator maintenance and repair services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'engineer',
    label: 'Engineer', 
    description: 'Engineering consultation and services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'equipment_repair',
    label: 'Equipment Repair', 
    description: 'Repair services for fitness and other equipment',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'fencing',
    label: 'Fencing', 
    description: 'Fence installation, repair, or replacement services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'fire_hydrant',
    label: 'Fire Hydrant', 
    description: 'Fire hydrant inspection and maintenance',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'fitness_equipment',
    label: 'Fitness Equipment', 
    description: 'Fitness equipment repair and maintenance',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'foundation_repair',
    label: 'Foundation Repair', 
    description: 'Building foundation repair services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'gutter_cleaning',
    label: 'Gutter Cleaning', 
    description: 'Gutter cleaning and maintenance services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'gym_equipment',
    label: 'Gym Equipment', 
    description: 'Fitness equipment installation and repair',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'handyman',
    label: 'Handyman', 
    description: 'General repairs and maintenance services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'hvac',
    label: 'HVAC', 
    description: 'Heating, ventilation, and air conditioning',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'junk_removal',
    label: 'Junk / Trash Removal', 
    description: 'Removal of unwanted items and waste',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'landscaping',
    label: 'Landscaping', 
    description: 'Outdoor improvements, gardening, and hardscaping',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'leak_detection',
    label: 'Leak Detection', 
    description: 'Water leak detection and repair services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'locksmith',
    label: 'Locksmith', 
    description: 'Lock installation, repair, and key services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'masonry',
    label: 'Masonry', 
    description: 'Stonework, brickwork, and concrete services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'mold_remediation',
    label: 'Mold Remediation', 
    description: 'Mold detection and removal services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'painting',
    label: 'Painting', 
    description: 'Interior or exterior painting projects',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'pest_control',
    label: 'Pest Control', 
    description: 'Pest management and extermination services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'plumbing',
    label: 'Plumbing', 
    description: 'Installation or repair of water and drainage systems',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'pond_servicing',
    label: 'Pond Servicing', 
    description: 'Pond maintenance and cleaning services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'pool_monitoring',
    label: 'Pool Monitoring', 
    description: 'Swimming pool monitoring and management',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'pool_service',
    label: 'Pool Service / Maintenance', 
    description: 'Swimming pool cleaning and maintenance',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'power_washing',
    label: 'Power Washing', 
    description: 'Pressure washing services for various surfaces',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'privacy_gate',
    label: 'Privacy Gate', 
    description: 'Gate installation, repair, and access control',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'regular_maintenance',
    label: 'Regular Maintenance', 
    description: 'Scheduled upkeep of property features and systems',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'renovation',
    label: 'Renovation Project', 
    description: 'Major renovations, remodeling, or structural changes',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'repair',
    label: 'Repair Work', 
    description: 'Fixing damaged or non-functioning parts of the property',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'reserve_study',
    label: 'Reserve Study', 
    description: 'Financial planning for future capital expenditures',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'roof_repair',
    label: 'Roof Repair / Replacement', 
    description: 'Roof repair, replacement, and maintenance',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'roofing',
    label: 'Roofing', 
    description: 'Roof repair, replacement, or installation',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'signs',
    label: 'Signs', 
    description: 'Sign creation, installation, and maintenance',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'sports_courts',
    label: 'Sports Courts', 
    description: 'Installation and maintenance of sports courts',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'street_repairs',
    label: 'Street Repairs / Paving / Striping', 
    description: 'Road maintenance, paving, and line striping services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'stucco',
    label: 'Stucco', 
    description: 'Stucco application, repair, and finishing services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'towing',
    label: 'Towing', 
    description: 'Vehicle towing and roadside assistance services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'trash_disposal',
    label: 'Trash Disposal', 
    description: 'Waste collection and disposal services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'trash_services',
    label: 'Trash Services', 
    description: 'Waste management and disposal services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'welder',
    label: 'Welder', 
    description: 'Metal welding and fabrication services',
    imageUrl: '/placeholder.svg'
  },
  { 
    value: 'window_services',
    label: 'Window Services', 
    description: 'Window cleaning, repair, and installation services',
    imageUrl: '/placeholder.svg'
  }
];

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
        {bidRequestCategories.map((category) => (
          <Card 
            key={category.value}
            className={`cursor-pointer hover:shadow-md transition-all border-2 ${
              selectedCategory === category.value ? 'border-primary' : 'border-transparent'
            }`}
            onClick={() => handleCategorySelect(category.value)}
          >
            <div className="p-4 flex flex-col h-full">
              <div className="bg-muted rounded-md aspect-video mb-3 overflow-hidden">
                {category.value === 'pest_control' ? (
                  <img 
                    src="https://cahergndkwfqltxyikyr.supabase.co/storage/v1/object/public/bidrequest-images//Pest-Control.jpg" 
                    alt={category.label} 
                    className="w-full h-full object-cover"
                  />
                ) : category.value === 'hvac' ? (
                  <img 
                    src="https://cahergndkwfqltxyikyr.supabase.co/storage/v1/object/public/bidrequest-images//HVAC.png" 
                    alt={category.label} 
                    className="w-full h-full object-cover"
                  />
                ) : category.imageUrl ? (
                  <img 
                    src={category.imageUrl} 
                    alt={category.label} 
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <h3 className="font-medium text-base">{category.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </FormItem>
  );
};

export default BidRequestCategorySelector;
