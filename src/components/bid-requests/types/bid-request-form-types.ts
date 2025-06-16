
import { z } from 'zod';

export const bidRequestFormSchema = z.object({
  association_id: z.string().min(1, 'Association is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  location: z.string().optional(),
  budget_range_min: z.number().min(0).optional(),
  budget_range_max: z.number().min(0).optional(),
  preferred_start_date: z.date().optional(),
  required_completion_date: z.date().optional(),
  bid_deadline: z.date().optional(),
  special_requirements: z.string().optional(),
});

export type BidRequestFormData = z.infer<typeof bidRequestFormSchema>;

export interface BidRequestFormProps {
  onSubmit?: (data: BidRequestFormData, isDraft?: boolean) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}
