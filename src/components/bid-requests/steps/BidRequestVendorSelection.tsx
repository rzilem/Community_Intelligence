
import React, { useState, useEffect } from 'react';
import { BidRequestWithVendors, BidRequestVendor } from '@/types/bid-request-types';
import { Vendor } from '@/types/vendor-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Search, Users, Info, AlertCircle, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { bidRequestService } from '@/services/bid-request-service';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [vendorCategories, setVendorCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
        
        // Extract unique categories
        const categories = Array.from(new Set(vendors.map(v => v.category).filter(Boolean))) as string[];
        setVendorCategories(categories);
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

  const filteredVendors = eligibleVendors.filter(vendor => {
    // Filter by search term
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
            {formData.category ? (
              <div className="flex items-center gap-2 mb-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Project Category: {formData.category}</AlertTitle>
                  <AlertDescription>
                    We recommend selecting vendors who specialize in this category.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Category Selected</AlertTitle>
                <AlertDescription>
                  Go back to step 1 (Basic Info) to select a project category to help find the right vendors.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors by name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <select 
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {vendorCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
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
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="mr-2">
                            {vendor.category}
                          </Badge>
                          {vendor.hasInsurance && (
                            <Badge variant="secondary" className="text-xs">
                              Insured
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    {vendor.rating && (
                      <div className="text-sm flex items-center">
                        <span className="font-medium mr-1">{vendor.rating}/5</span>
                        <span className="text-muted-foreground">Rating</span>
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
                {searchTerm && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchTerm('')}
                    className="mt-1"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
            
            <div className="bg-muted p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">Vendor Invitation Status</span>
                </div>
                {selectedVendors.length > 0 ? (
                  <Badge variant="outline" className="bg-primary/10">
                    {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''} selected
                  </Badge>
                ) : null}
              </div>
              
              {selectedVendors.length > 0 ? (
                <p className="text-sm text-muted-foreground mt-2">
                  Vendors will be invited to submit bids once you publish this request.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  No vendors selected yet. Select at least one vendor to proceed.
                </p>
              )}
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
