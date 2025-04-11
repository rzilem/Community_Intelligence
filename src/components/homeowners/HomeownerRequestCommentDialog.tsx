
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { useSupabaseCreate } from '@/hooks/supabase';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface HomeownerRequestCommentDialogProps {
  request: HomeownerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  content: z.string().min(3, { message: "Comment must be at least 3 characters" }),
});

const HomeownerRequestCommentDialog: React.FC<HomeownerRequestCommentDialogProps> = ({ 
  request, 
  open, 
  onOpenChange 
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  const { mutate: createComment, isPending } = useSupabaseCreate(
    'comments',
    {
      onSuccess: () => {
        toast.success('Comment added successfully');
        form.reset();
        onOpenChange(false);
      },
    }
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!request) return;

    try {
      // Get current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to add a comment');
        return;
      }
      
      createComment({
        content: values.content,
        parent_id: request.id,
        parent_type: 'homeowner_request',
        user_id: user.id,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Adding a comment to request: <span className="font-medium">{request.title}</span>
            </p>
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Enter your comment here" 
                      className="min-h-32"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Add Comment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestCommentDialog;
