
import React, { useState, useEffect } from 'react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Search, MapPin } from 'lucide-react';

interface BidRequestLocationMapProps {
  formData: Partial<BidRequestWithVendors>;
  onUpdate: (data: Partial<BidRequestWithVendors>) => void;
}

const BidRequestLocationMap: React.FC<BidRequestLocationMapProps> = ({ 
  formData, 
  onUpdate 
}) => {
  const [address, setAddress] = useState(formData.locationData?.address || '');
  
  const form = useForm<Partial<BidRequestWithVendors>>({
    defaultValues: {
      locationNotes: formData.locationNotes || '',
      locationData: formData.locationData || { address: '', coordinates: null }
    }
  });

  const handleAddressSubmit = () => {
    // In a real implementation, this would connect to a mapping API like Google Maps
    // For now, we'll just update the address
    const locationData = {
      address,
      coordinates: { lat: 0, lng: 0 } // Placeholder coordinates
    };
    
    onUpdate({ 
      locationData,
      locationNotes: form.getValues('locationNotes')
    });
  };

  // Auto-save notes as the user types
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.locationNotes !== formData.locationNotes) {
        onUpdate({ locationNotes: value.locationNotes });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Location</CardTitle>
            <CardDescription>
              Specify where the project will take place to help vendors understand the site location.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">
                  Address
                </label>
                <Input 
                  placeholder="Enter project location address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <Button onClick={handleAddressSubmit} type="button">
                <Search className="h-4 w-4 mr-2" />
                Locate
              </Button>
            </div>

            {/* Placeholder for map component */}
            <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center border">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p>Map view would be displayed here</p>
                {address && (
                  <p className="mt-2 text-sm">Selected address: {address}</p>
                )}
              </div>
            </div>

            <FormFieldTextarea
              form={form}
              name="locationNotes"
              label="Location Notes"
              placeholder="Provide any additional details about the location (e.g., access instructions, parking information)"
              rows={3}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default BidRequestLocationMap;
