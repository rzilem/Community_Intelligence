
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { WorkflowType } from '@/types/workflow-types';

const workflowTypes: WorkflowType[] = [
  'Financial',
  'Compliance',
  'Maintenance',
  'Resident Management',
  'Governance',
  'Communication'
];

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['Financial', 'Compliance', 'Maintenance', 'Resident Management', 'Governance', 'Communication']),
});

type FormValues = z.infer<typeof formSchema>;

interface WorkflowCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkflow: (values: FormValues) => Promise<void>;
  isCreating: boolean;
}

const WorkflowCreateDialog: React.FC<WorkflowCreateDialogProps> = ({
  open,
  onOpenChange,
  onCreateWorkflow,
  isCreating
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'Governance',
    }
  });

  async function onSubmit(values: FormValues) {
    try {
      await onCreateWorkflow(values);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Create a custom workflow template for your association processes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter workflow name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Choose a clear, descriptive name for your workflow.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workflow type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workflowTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Categorize your workflow to help organize it.
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief description of this workflow"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the purpose and usage of this workflow.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Workflow'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowCreateDialog;
