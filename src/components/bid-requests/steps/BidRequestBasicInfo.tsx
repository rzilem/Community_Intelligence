
import React from 'react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import FormFieldInput from '@/components/homeowners/form/FormFieldInput';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import BidRequestCategorySelector from '@/components/bid-requests/form/BidRequestCategorySelector';
import BidRequestImageUpload from '@/components/bid-requests/form/BidRequestImageUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const form = useForm<Partial<BidRequestWithVendors>>({
    defaultValues: {
      title: formData.title || '',
      description: formData.description || '',
      category: formData.category || '',
      // Removed budget from default values
    }
  });

  const handleSubmit = (data: Partial<BidRequestWithVendors>) => {
    onUpdate(data);
  };

  // Auto-save as the user types
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      handleSubmit(value as Partial<BidRequestWithVendors>);
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Form {...form}>
      <form className="space-y-6">
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
            
            <div>
              <BidRequestCategorySelector form={form} />
            </div>
            
            <BidRequestImageUpload onFileSelect={(file) => onImageSelect(file)} />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default BidRequestBasicInfo;
