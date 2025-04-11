
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCreate } from '@/hooks/supabase';

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  association_id: z.string().uuid("Please select an association"),
  property_id: z.string().uuid("Please select a property"),
  resident_type: z.enum(["owner", "tenant", "family", "other"]),
  is_primary: z.boolean().default(true),
  move_in_date: z.string().optional(),
  emergency_contact: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface AddOwnerFormProps {
  onSuccess: (newOwner: any) => void;
  onCancel: () => void;
}

const AddOwnerForm: React.FC<AddOwnerFormProps> = ({ onSuccess, onCancel }) => {
  const [associations, setAssociations] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use the useSupabaseCreate hook for better error handling
  const createResident = useSupabaseCreate('residents', {
    showSuccessToast: true,
    showErrorToast: true
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      association_id: '',
      property_id: '',
      resident_type: 'owner',
      is_primary: true,
      move_in_date: '',
      emergency_contact: ''
    }
  });

  // Get the selected association ID
  const selectedAssociationId = form.watch('association_id');

  // Fetch associations
  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_user_associations');

        if (error) throw error;
        setAssociations(data || []);
      } catch (error) {
        console.error('Error fetching associations:', error);
        toast.error('Failed to load associations');
      }
    };

    fetchAssociations();
  }, []);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*');

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties');
      }
    };

    fetchProperties();
  }, []);

  // Filter properties based on selected association
  useEffect(() => {
    if (selectedAssociationId && properties.length > 0) {
      const filtered = properties.filter(
        property => property.association_id === selectedAssociationId
      );
      setFilteredProperties(filtered);
      
      // Reset property selection if it's not in the filtered list
      const currentPropertyId = form.getValues('property_id');
      if (currentPropertyId && !filtered.some(p => p.id === currentPropertyId)) {
        form.setValue('property_id', '');
      }
    } else {
      setFilteredProperties([]);
      form.setValue('property_id', '');
    }
  }, [selectedAssociationId, properties, form]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Create the resident using the hook which handles RLS better
      const newResident = await createResident.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        property_id: data.property_id,
        resident_type: data.resident_type,
        is_primary: data.is_primary,
        move_in_date: data.move_in_date || null,
        emergency_contact: data.emergency_contact || null
      });

      if (newResident) {
        // Get property details
        const selectedProperty = properties.find(p => p.id === data.property_id);
        const selectedAssociation = associations.find(a => a.id === data.association_id);

        // Create a mock object for UI integration
        const newOwnerForUI = {
          id: newResident.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          type: data.resident_type,
          propertyAddress: selectedProperty?.address || 'Unknown',
          association: selectedAssociation?.name || 'Unknown',
          status: 'active',
          moveInDate: data.move_in_date || new Date().toISOString().split('T')[0],
          propertyId: data.property_id
        };

        toast.success('Owner added successfully');
        onSuccess(newOwnerForUI);
      }
    } catch (error: any) {
      console.error('Error adding owner:', error);
      toast.error(error.message || 'Failed to add owner');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(123) 456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="association_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Association</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an association" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {associations.map(association => (
                    <SelectItem key={association.id} value={association.id}>
                      {association.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="property_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedAssociationId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedAssociationId ? "Select a property" : "Select an association first"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.address} {property.unit_number ? `Unit ${property.unit_number}` : ''}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-properties" disabled>
                      No properties available for this association
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resident_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resident Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="family">Family Member</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_primary"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Primary Resident</FormLabel>
                <p className="text-sm text-muted-foreground">
                  This is the primary owner/resident for the property
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="move_in_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Move-In Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergency_contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact</FormLabel>
              <FormControl>
                <Input placeholder="Name: (123) 456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Owner'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddOwnerForm;
