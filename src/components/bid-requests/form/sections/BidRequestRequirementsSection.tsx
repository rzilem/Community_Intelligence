
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BidRequestFormData } from '../../types/bid-request-form-types';

interface BidRequestRequirementsSectionProps {
  form: UseFormReturn<BidRequestFormData>;
}

const BidRequestRequirementsSection: React.FC<BidRequestRequirementsSectionProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Requirements</CardTitle>
        <CardDescription>
          Any special requirements or specifications for the project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <FormField
            control={form.control}
            name="special_requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requirements</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any special requirements, materials, certifications, or other specifications..."
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </CardContent>
    </Card>
  );
};

export default BidRequestRequirementsSection;
