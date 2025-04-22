
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { NewFormDialogProps } from '@/types/form-builder-types';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const NewFormDialog: React.FC<NewFormDialogProps> = ({ 
  open, 
  onOpenChange,
  associationId 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!associationId) {
      toast.error("Please select an association first");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a new form template record
      const { data, error } = await supabase
        .from('form_templates')
        .insert({
          name: values.name,
          description: values.description || null,
          association_id: associationId,
          fields: [],
          is_public: false,
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success("Form created successfully");
      form.reset();
      onOpenChange(false);
      
      // Navigate to form editor (not implemented yet)
      // You could add a callback prop to handle navigation
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
            
            {associationId ? (
              <div className="pt-2 text-sm text-muted-foreground">
                This form will be associated with the selected association.
              </div>
            ) : (
              <div className="pt-2 text-sm text-amber-500">
                Please select an association before creating a form.
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!associationId || isSubmitting}
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
