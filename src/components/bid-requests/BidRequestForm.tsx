
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { bidRequestService } from '@/services/bid-request-service';
import { BidRequestWithVendors, BidRequestVendor } from '@/types/bid-request-types';
import { Vendor } from '@/types/vendor-types';
import { FileUploader } from '@/components/ui/file-uploader';

interface BidRequestFormProps {
  onSubmit: (bidRequest: Partial<BidRequestWithVendors>) => void;
  initialData?: Partial<BidRequestWithVendors>;
}

const BidRequestForm: React.FC<BidRequestFormProps> = ({ onSubmit, initialData }) => {
  const [eligibleVendors, setEligibleVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<Partial<BidRequestWithVendors>>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      status: initialData?.status || 'draft',
      budget: initialData?.budget || undefined,
      category: initialData?.category || '',
      visibility: initialData?.visibility || 'private',
      dueDate: initialData?.dueDate || '',
    }
  });

  useEffect(() => {
    const fetchEligibleVendors = async () => {
      try {
        const vendors = await bidRequestService.filterEligibleVendors('');
        setEligibleVendors(vendors);
      } catch (error) {
        console.error('Error fetching eligible vendors:', error);
      }
    };

    fetchEligibleVendors();
  }, []);

  const handleFormSubmit = async (data: Partial<BidRequestWithVendors>) => {
    try {
      // If an image was uploaded, prepare for upload
      let imageUrl;
      if (imageFile) {
        // We'll handle the actual upload after creating the bid request
        // Just noting we have an image to upload
        imageUrl = 'pending_upload';
      }

      // Prepare the bid request data
      const bidRequestData: Partial<BidRequestWithVendors> = {
        ...data,
        imageUrl,
        // Create proper vendor objects that match the expected type
        vendors: selectedVendors.map(vendorId => {
          const vendor: Partial<BidRequestVendor & { vendorDetails?: Vendor }> = {
            vendorId,
            status: 'invited'
          };
          return vendor;
        })
      };

      // Submit the bid request
      onSubmit(bidRequestData);
    } catch (error) {
      console.error('Error submitting bid request:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter bid request title" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide details about the bid request" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Add your categories here */}
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="landscaping">Landscaping</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter budget" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormItem>
          <FormLabel>Bid Request Image</FormLabel>
          <FileUploader 
            onFileSelect={(file) => setImageFile(file)}
            accept="image/*"
          />
        </FormItem>

        <FormItem>
          <FormLabel>Select Eligible Vendors</FormLabel>
          <Select 
            onValueChange={(value) => {
              // Prevent duplicate selections
              if (!selectedVendors.includes(value)) {
                setSelectedVendors([...selectedVendors, value]);
              }
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select vendors to invite" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {eligibleVendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>

        {selectedVendors.length > 0 && (
          <div>
            <FormLabel>Selected Vendors</FormLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedVendors.map((vendorId) => {
                const vendor = eligibleVendors.find(v => v.id === vendorId);
                return (
                  <div 
                    key={vendorId} 
                    className="bg-gray-100 px-2 py-1 rounded-md flex items-center"
                  >
                    {vendor?.name}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-5 w-5"
                      onClick={() => setSelectedVendors(
                        selectedVendors.filter(id => id !== vendorId)
                      )}
                    >
                      ×
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full">
          Create Bid Request
        </Button>
      </form>
    </Form>
  );
};

export default BidRequestForm;
