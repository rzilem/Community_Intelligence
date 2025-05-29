
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectTypes } from '@/hooks/bid-requests/useProjectTypes';

interface BidRequestFormData {
  hoa_id: string;
  title: string;
  description: string;
  location: string;
  number_of_bids_wanted: number;
  project_type_id: string;
  category: string;
  project_details: Record<string, any>;
  special_requirements?: string;
  selected_vendor_ids: string[];
  allow_public_bidding: boolean;
  budget_range_min?: number;
  budget_range_max?: number;
  preferred_start_date?: string;
  required_completion_date?: string;
  bid_deadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: File[];
  created_by: string;
  status: 'draft' | 'published';
}

interface EnhancedProjectTypeSelectorProps {
  form: UseFormReturn<BidRequestFormData>;
  onChange?: (projectTypeId: string, categorySlug: string) => void;
}

const EnhancedProjectTypeSelector: React.FC<EnhancedProjectTypeSelectorProps> = ({ form, onChange }) => {
  const { data: projectTypes, isLoading, error } = useProjectTypes();
  const { setValue, watch } = form;
  const selectedCategory = watch('category');

  const handleCategorySelect = (projectType: any) => {
    setValue('category', projectType.slug, { shouldValidate: true });
    setValue('project_type_id', projectType.id, { shouldValidate: true });
    
    // Call onChange callback if provided
    if (onChange) {
      onChange(projectType.id, projectType.slug);
    }
  };

  if (isLoading) {
    return (
      <FormItem className="space-y-4">
        <FormLabel>Project Category</FormLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="aspect-video mb-3 rounded-md" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))}
        </div>
      </FormItem>
    );
  }

  if (error) {
    return (
      <FormItem className="space-y-4">
        <FormLabel>Project Category</FormLabel>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load project types. Please try again.</p>
        </div>
      </FormItem>
    );
  }

  return (
    <FormItem className="space-y-4">
      <FormLabel>Project Category</FormLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto p-1">
        {projectTypes?.map((projectType) => (
          <Card 
            key={projectType.id}
            className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 transform hover:-translate-y-1 ${
              selectedCategory === projectType.slug 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-transparent hover:border-primary/20'
            }`}
            onClick={() => handleCategorySelect(projectType)}
          >
            <div className="p-4 flex flex-col h-full">
              <div className="relative bg-muted rounded-md aspect-video mb-3 overflow-hidden">
                {projectType.image_url ? (
                  <img 
                    src={projectType.image_url} 
                    alt={projectType.name} 
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <span className="text-primary/60 text-xs font-medium">
                      {projectType.name.charAt(0)}
                    </span>
                  </div>
                )}
                {selectedCategory === projectType.slug && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className={`font-semibold text-sm mb-1 line-clamp-2 ${
                  selectedCategory === projectType.slug ? 'text-primary' : 'text-foreground'
                }`}>
                  {projectType.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 flex-1">
                  {projectType.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <FormMessage />
    </FormItem>
  );
};

export default EnhancedProjectTypeSelector;
