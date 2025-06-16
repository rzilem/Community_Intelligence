
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import AssociationSelector from '@/components/associations/AssociationSelector';
import CategorySelector from '../fields/CategorySelector';
import PrioritySelector from '../fields/PrioritySelector';
import { BidRequestFormData } from '../../types/bid-request-form-types';

interface BidRequestBasicInfoSectionProps {
  form: UseFormReturn<BidRequestFormData>;
  onAssociationChange: (associationId: string) => void;
}

const BidRequestBasicInfoSection: React.FC<BidRequestBasicInfoSectionProps> = ({
  form,
  onAssociationChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Provide the essential details for your bid request
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <FormField
                control={form.control}
                name="association_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Association *</FormLabel>
                    <FormControl>
                      <AssociationSelector 
                        onAssociationChange={onAssociationChange}
                        initialAssociationId={field.value}
                        label={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CategorySelector form={form} />
              <PrioritySelector form={form} />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the project requirements, scope, and any specific details..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Specific location within property" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BidRequestBasicInfoSection;
