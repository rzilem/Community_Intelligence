
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { NoteType } from '@/components/homeowners/detail/types';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/useAuth';

const noteFormSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface AddNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote?: (note: Omit<NoteType, 'date'>) => void;
  homeownerId: string;
}

export const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  isOpen,
  onClose,
  onAddNote,
  homeownerId
}) => {
  const { user } = useAuth();
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      content: '',
    },
  });

  const handleSubmit = async (values: NoteFormValues) => {
    try {
      if (onAddNote) {
        const note: Omit<NoteType, 'date'> = {
          type: 'manual',
          author: user?.profile?.first_name && user?.profile?.last_name 
            ? `${user.profile.first_name} ${user.profile.last_name}`
            : user?.email || 'Staff Member',
          content: values.content,
        };
        
        await onAddNote(note);
        toast.success('Note added successfully');
        form.reset();
        onClose();
      } else {
        console.error('onAddNote function not provided');
        toast.error('Unable to add note. Please try again.');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormFieldTextarea
              form={form}
              name="content"
              label="Note Content"
              placeholder="Enter your note here..."
              rows={5}
            />
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Add Note
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
