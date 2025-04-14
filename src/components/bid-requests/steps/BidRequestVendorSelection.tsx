
import React, { useState, useEffect } from 'react';
import { BidRequestWithVendors, BidRequestVendor } from '@/types/bid-request-types';
import { Vendor } from '@/types/vendor-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { bidRequestService } from '@/services/bid-request-service';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';

interface BidRequestVendorSelectionProps {
  formData: Partial<BidRequestWithVendors>;
  onUpdate: (data: Partial<BidRequestWithVendors>) => void;
}

const BidRequestVendorSelection: React.FC<BidRequestVendorSelectionProps> = ({ 
  formData, 
  onUpdate 
}) => {
  const [eligibleVendors, setEligibleVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>(
    (formData.vendors || []).map(v => v.vendorId)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm<Partial<BidRequestWithVendors>>({
    defaultValues: {
      vendorNotes: formData.vendorNotes || '',
    }
  });

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const vendors = await bidRequestService.filterEligibleVendors(formData.associationId || '');
        setEligibleVendors(vendors);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [formData.associationId]);

  const toggleVendorSelection = (vendorId: string) => {
    setSelectedVendors(prev => {
      const newSelection = prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId];
      
      // Update parent component with vendor selection
      // Create vendor objects with the required properties
      const vendors = newSelection.map(id => ({
        id: `temp-${id}`, // Temporary ID that will be replaced on server
        bidRequestId: 'pending', // Will be set when the bid request is created
        vendorId: id,
        status: 'invited' as const
      }));
      
      onUpdate({ vendors });
      
      return newSelection;
    });
  };

  const filteredVendors = eligibleVendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-save notes as the user types
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.vendorNotes !== formData.vendorNotes) {
        onUpdate({ vendorNotes: value.vendorNotes });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Vendors</CardTitle>
            <CardDescription>
              Choose which vendors you'd like to invite to bid on this project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading vendors...</p>
                </div>
              ) : filteredVendors.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                  {filteredVendors.map((vendor) => (
                    <div 
                      key={vendor.id}
                      className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-accent ${
                        selectedVendors.includes(vendor.id) ? 'border border-primary' : 'border'
                      }`}
                      onClick={() => toggleVendorSelection(vendor.id)}
                    >
                      <div className="mr-3">
                        <Checkbox 
                          checked={selectedVendors.includes(vendor.id)} 
                          onCheckedChange={() => toggleVendorSelection(vendor.id)}
                          id={`vendor-${vendor.id}`}
                        />
                      </div>
                      <div className="flex-1">
                        <Label 
                          htmlFor={`vendor-${vendor.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {vendor.name}
                        </Label>
                        {vendor.category && (
                          <p className="text-sm text-muted-foreground">
                            {vendor.category}
                          </p>
                        )}
                      </div>
                      {vendor.rating && (
                        <div className="text-sm text-muted-foreground">
                          Rating: {vendor.rating}/5
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No vendors found matching your search' : 'No vendors available'}
                  </p>
                </div>
              )}
              
              <div className="mt-3 text-sm">
                {selectedVendors.length > 0 ? (
                  <p className="text-primary">
                    {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''} selected
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    No vendors selected yet
                  </p>
                )}
              </div>
            </div>
            
            <FormFieldTextarea
              form={form}
              name="vendorNotes"
              label="Notes to Vendors"
              placeholder="Include any specific instructions or information for the selected vendors"
              rows={3}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default BidRequestVendorSelection;
