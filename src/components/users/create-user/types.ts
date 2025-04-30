
import * as z from 'zod';

export const newUserSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  role: z.enum(['admin', 'manager', 'resident', 'maintenance', 'accountant', 'user']),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export type NewUserFormValues = z.infer<typeof newUserSchema>;
