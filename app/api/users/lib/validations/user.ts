import { z } from 'zod';

export const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  companyName: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  taxId: z.string().optional(),
});
