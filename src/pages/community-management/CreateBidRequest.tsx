import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Save, Users } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { useAuth } from '@/contexts/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/supabase';
import { format } from 'date-fns';

const bidRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  budget: z.string().optional(),
  deadline: z.date().optional(),
  association_id: z.string().min(1, 'Please select an association'),
  status: z.string().default('draft'),
});

type BidRequestFormValues = z.infer<typeof bidRequestSchema>;

const CreateBidRequest = () => {
  const navigate = useNavigate();
  const { currentAssociation, user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user's associations
  const { data: userAssociations, isLoading: loadingAssociations } = useSupabaseQuery(
    'user_associations',
    {
      select: 'association_id, associations:association_id(id, name)',
      filter: [{ column: 'user_id', value: user?.id }],
    },
    !!user?.id
  );

  const form = useForm<BidRequestFormValues>({
    resolver: zodResolver(bidRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      budget: '',
      status: 'draft',
      association_id: currentAssociation?.id || '',
    },
  });

  const onSubmit = async (values: BidRequestFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Format the data for submission
      const bidRequestData = {
        title: values.title,
        description: values.description,
        category: values.category,
        budget: values.budget ? parseFloat(values.budget) : null,
        association_id: values.association_id,
        created_by: user?.id,
        status: 'open',
        created_at: new Date().toISOString(),
        bid_deadline: values.deadline ? format(values.deadline, 'yyyy-MM-dd HH:mm:ssXXX') : null,
      };
      
      // Insert into database
      const { data, error } = await supabase
        .from('bid_requests')
        .insert(bidRequestData)
        .select('id')
        .single();
        
      if (error) throw error;
      
      toast.success('Bid request created successfully!');
      navigate('/community-management/bid-requests');
    } catch (error: any) {
      console.error('Error creating bid request:', error);
      toast.error(`Failed to create bid request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const saveAsDraft = async () => {
    try {
      setIsSaving(true);
      
      // Validate form data
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const values = form.getValues();
      
      // Format the data for submission
      const bidRequestData = {
        title: values.title,
        description: values.description,
        category: values.category,
        budget: values.budget ? parseFloat(values.budget) : null,
        association_id: values.association_id,
        created_by: user?.id,
        status: 'draft',
        created_at: new Date().toISOString(),
        bid_deadline: values.deadline ? format(values.deadline, 'yyyy-MM-dd HH:mm:ssXXX') : null,
      };
      
      // Insert into database
      const { data, error } = await supabase
        .from('bid_requests')
        .insert(bidRequestData)
        .select('id')
        .single();
        
      if (error) throw error;
      
      toast.success('Draft saved successfully!');
      navigate('/community-management/bid-requests');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error(`Failed to save draft: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTemplate
      title="Create Bid Request"
      icon={<Users className="h-8 w-8" />}
      description="Create a new bid request for vendors"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/community-management/bid-requests')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bid Requests
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>New Bid Request</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="details" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a title for this bid request" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear, concise title for the bid request
                        </FormDescription>
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
                            placeholder="Describe the project or service needed in detail" 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of what you're looking for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="landscaping">Landscaping</SelectItem>
                              <SelectItem value="renovation">Renovation</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                              <SelectItem value="cleaning">Cleaning</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The type of service or project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. $5,000 - $10,000" {...field} />
                          </FormControl>
                          <FormDescription>
                            Estimated budget range for this project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Deadline (Optional)</FormLabel>
                          <DatePicker
                            date={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                          />
                          <FormDescription>
                            When bids should be submitted by
                          </FormDescription>
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
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an association" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loadingAssociations ? (
                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                              ) : userAssociations && userAssociations.length > 0 ? (
                                userAssociations.map((ua: any) => (
                                  <SelectItem key={ua.associations.id} value={ua.associations.id}>
                                    {ua.associations.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>No associations available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The association this bid request is for
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="requirements" className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      This section will allow you to add specific requirements, qualifications, and scope details.
                      This feature will be available in a future update.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="attachments" className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      This section will allow you to upload documents, images, and other files related to the bid request.
                      This feature will be available in a future update.
                    </p>
                  </div>
                </TabsContent>
                
                <Separator />
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveAsDraft}
                    disabled={isSaving || isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSaving || isSubmitting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Bid Request'}
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default CreateBidRequest;
