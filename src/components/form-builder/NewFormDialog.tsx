import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { NewFormDialogProps } from '@/types/form-builder-types';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSupabaseQuery } from '@/hooks/supabase';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  form_type: z.string().optional(),
  is_global: z.boolean().default(false),
  association_ids: z.array(z.string()).optional(),
});

export const NewFormDialog: React.FC<NewFormDialogProps> = ({ 
  open, 
  onOpenChange,
  associationId 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: associations = [] } = useSupabaseQuery('associations', {
    select: 'id, name',
    order: { column: 'name', ascending: true }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      form_type: undefined,
      is_global: false,
      association_ids: associationId ? [associationId] : []
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .insert({
          name: values.name,
          description: values.description || null,
          form_type: values.form_type || null,
          is_global: values.is_global,
          fields: [],
          is_public: false,
        })
        .select('id')
        .single();

      if (error) throw error;

      if (!values.is_global && values.association_ids?.length) {
        const associations = values.association_ids.map(association_id => ({
          form_template_id: data.id,
          association_id
        }));

        const { error: assocError } = await supabase
          .from('form_template_associations')
          .insert(associations);

        if (assocError) throw assocError;
      }

      toast.success("Form created successfully");
      form.reset();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error("Failed to create form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new form template.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter form name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="form_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select form type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="portal_request">Portal Request</SelectItem>
                      <SelectItem value="arc_application">ARC Application</SelectItem>
                      <SelectItem value="pool_form">Pool Form</SelectItem>
                      <SelectItem value="gate_request">Gate Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the form purpose..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_global"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Make this form available to all associations
                  </FormLabel>
                </FormItem>
              )}
            />

            {!form.watch('is_global') && (
              <FormField
                control={form.control}
                name="association_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associations</FormLabel>
                    <FormControl>
                      <div className="grid gap-2">
                        {associations.map((association) => (
                          <div key={association.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(association.id)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...(field.value || []), association.id]
                                  : (field.value || []).filter(id => id !== association.id);
                                field.onChange(newValue);
                              }}
                            />
                            <Label>{association.name}</Label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Form"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
