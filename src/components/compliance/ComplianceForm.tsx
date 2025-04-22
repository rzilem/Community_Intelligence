
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useComplianceManagement } from '@/hooks/compliance/useComplianceManagement';
import { Compliance } from '@/types/compliance-types';
import { useProperties } from '@/hooks/properties/useProperties';

const violationTypes = [
  'Architectural',
  'Landscaping',
  'Maintenance',
  'Noise',
  'Parking',
  'Pet',
  'Trash',
  'Other'
];

const formSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  residentId: z.string().optional(),
  violationType: z.string().min(1, 'Violation type is required'),
  description: z.string().optional(),
  status: z.enum(['open', 'in-progress', 'resolved', 'escalated']).optional(),
  dueDate: z.date().optional(),
  fineAmount: z.number().nonnegative().optional(),
  resolvedDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ComplianceFormProps {
  associationId: string;
  defaultValues?: Compliance | null;
  onSuccess: () => void;
}

const ComplianceForm: React.FC<ComplianceFormProps> = ({
  associationId,
  defaultValues,
  onSuccess
}) => {
  const { properties, isLoading: isLoadingProperties } = useProperties(associationId);
  const { createComplianceIssue, updateComplianceIssue } = useComplianceManagement();
  
  const isEditMode = !!defaultValues;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: defaultValues?.property_id || '',
      residentId: defaultValues?.resident_id || '',
      violationType: defaultValues?.violation_type || '',
      description: defaultValues?.description || '',
      status: defaultValues?.status || 'open',
      dueDate: defaultValues?.due_date ? new Date(defaultValues.due_date) : undefined,
      fineAmount: defaultValues?.fine_amount ? Number(defaultValues.fine_amount) : undefined,
      resolvedDate: defaultValues?.resolved_date ? new Date(defaultValues.resolved_date) : undefined,
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    try {
      if (isEditMode && defaultValues) {
        // Update existing issue
        await updateComplianceIssue.mutateAsync({
          id: defaultValues.id,
          propertyId: values.propertyId,
          residentId: values.residentId,
          violationType: values.violationType,
          description: values.description,
          status: values.status,
          dueDate: values.dueDate?.toISOString().split('T')[0],
          fineAmount: values.fineAmount,
          resolvedDate: values.resolvedDate?.toISOString().split('T')[0],
        });
      } else {
        // Create new issue
        await createComplianceIssue.mutateAsync({
          associationId,
          propertyId: values.propertyId,
          residentId: values.residentId,
          violationType: values.violationType,
          description: values.description,
          dueDate: values.dueDate?.toISOString().split('T')[0],
          fineAmount: values.fineAmount,
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving compliance issue:', error);
    }
  };
  
  const isLoading = createComplianceIssue.isPending || updateComplianceIssue.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Property Selection */}
        <FormField
          control={form.control}
          name="propertyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value} 
                disabled={isLoadingProperties}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Violation Type */}
        <FormField
          control={form.control}
          name="violationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Violation Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select violation type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {violationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter a detailed description of the violation"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Status (Edit mode only) */}
        {isEditMode && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Due Date */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Fine Amount */}
        <FormField
          control={form.control}
          name="fineAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fine Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Resolved Date (Edit mode only) */}
        {isEditMode && form.watch('status') === 'resolved' && (
          <FormField
            control={form.control}
            name="resolvedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Resolved Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Update Violation' : 'Create Violation'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ComplianceForm;
