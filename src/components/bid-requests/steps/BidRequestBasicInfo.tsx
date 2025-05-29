
import React from 'react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';

// Create a schema for form validation
const basicInfoSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters long" }),
  category: z.string().min(1, { message: "Please select a category" }),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;

interface BidRequestBasicInfoProps {
  formData: Partial<BidRequestWithVendors>;
  onUpdate: (data: Partial<BidRequestWithVendors>) => void;
  onImageSelect?: (file: File | null) => void;
}

const categories = [
  { value: 'landscaping', label: 'Landscaping & Grounds' },
  { value: 'maintenance', label: 'Building Maintenance' },
  { value: 'hvac', label: 'HVAC Services' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'painting', label: 'Painting' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'security', label: 'Security' },
  { value: 'pool', label: 'Pool Service' },
  { value: 'other', label: 'Other' }
];

const BidRequestBasicInfo: React.FC<BidRequestBasicInfoProps> = ({ 
  formData, 
  onUpdate,
  onImageSelect 
}) => {
  const form = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: formData.title || '',
      description: formData.description || '',
      category: formData.category || '',
    },
    mode: 'onChange'
  });

  const { formState } = form;

  const handleSubmit = (data: BasicInfoValues) => {
    onUpdate(data);
  };

  // Auto-save as the user types, but only if valid
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      if (formState.isValid) {
        handleSubmit(value as BasicInfoValues);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, formState.isValid, onUpdate]);

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Project Information</CardTitle>
            <CardDescription>
              Provide the essential details about the project to help vendors understand your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a clear, descriptive title for the project" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of the project requirements"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {onImageSelect && (
              <div className="space-y-2">
                <FormLabel>Project Images (Optional)</FormLabel>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      onImageSelect(file);
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Upload an image to help vendors understand the project scope
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!formState.isValid || !formState.isDirty}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default BidRequestBasicInfo;
