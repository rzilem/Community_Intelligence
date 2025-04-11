
import { z } from 'zod';

// Form schema with validation
export const ownerFormSchema = z.object({
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

export type OwnerFormValues = z.infer<typeof ownerFormSchema>;

export const defaultOwnerFormValues: Partial<OwnerFormValues> = {
  name: '',
  email: '',
  phone: '',
  association_id: '',
  property_id: '',
  resident_type: 'owner',
  is_primary: true,
  move_in_date: '',
  emergency_contact: ''
};
