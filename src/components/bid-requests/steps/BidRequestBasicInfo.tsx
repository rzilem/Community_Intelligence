
import React from 'react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import FormFieldInput from '@/components/homeowners/form/FormFieldInput';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import BidRequestCategorySelector from '@/components/bid-requests/form/BidRequestCategorySelector';
import BidRequestImageUpload from '@/components/bid-requests/form/BidRequestImageUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
  onImageSelect: (file: File | null) => void;
}

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
  }, [form.watch, formState.isValid]);

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
            <FormFieldInput
              form={form}
              name="title"
              label="Project Title"
              placeholder="Enter a clear, descriptive title for the project"
            />
            
            <FormFieldTextarea
              form={form}
              name="description"
              label="Project Description"
              placeholder="Provide a detailed description of the project requirements"
              rows={5}
            />
            
            <div className="w-full">
              <BidRequestCategorySelector form={form} />
            </div>
            
            <div className="space-y-2">
              <BidRequestImageUpload 
                onFileSelect={(file) => onImageSelect(file)} 
                currentImageUrl={formData.imageUrl}
              />
            </div>

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
