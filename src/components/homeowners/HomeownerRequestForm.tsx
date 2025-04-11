
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HomeownerRequestType, HomeownerRequestPriority } from '@/types/homeowner-request-types';
import { useSupabaseCreate } from '@/hooks/supabase';
import { useSupabaseQuery } from '@/hooks/supabase';

const requestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['maintenance', 'compliance', 'billing', 'general', 'amenity']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  propertyId: z.string().uuid('Please select a property'),
  associationId: z.string().uuid('Please select an association'),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface HomeownerRequestFormProps {
  onSuccess?: () => void;
}

export function HomeownerRequestForm({ onSuccess }: HomeownerRequestFormProps) {
  // Fetch associations for the select dropdown
  const { data: associations = [] } = useSupabaseQuery<any[]>(
    'associations',
    {
      select: 'id, name',
    }
  );

  // Fetch properties for the select dropdown (we'll filter by association later)
  const { data: properties = [] } = useSupabaseQuery<any[]>(
    'properties',
    {
      select: 'id, address, unit_number, association_id',
    }
  );

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'maintenance',
      priority: 'medium',
      propertyId: '',
      associationId: '',
    },
  });

  const { mutate: createRequest, isPending } = useSupabaseCreate('homeowner_requests', {
    onSuccess: () => {
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    },
  });

  const onSubmit = (data: RequestFormValues) => {
    createRequest({
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      property_id: data.propertyId,
      association_id: data.associationId,
      // The resident_id will be set automatically to auth.uid() by RLS
    });
  };

  // Filter properties based on selected association
  const selectedAssociationId = form.watch('associationId');
  const filteredProperties = selectedAssociationId 
    ? properties.filter(property => property.association_id === selectedAssociationId)
    : properties;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter request title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="associationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Association</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select association" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {associations.map((association) => (
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
          name="propertyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!selectedAssociationId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedAssociationId ? "Select property" : "Select an association first"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address} {property.unit_number ? `Unit ${property.unit_number}` : ''}
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="amenity">Amenity</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Describe your request in detail..." 
                  {...field} 
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
