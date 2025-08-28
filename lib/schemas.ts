
import { z } from 'zod';

export const updateEmployeeSchema = z.object({
  employee_id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  is_active: z.boolean().optional(),
}).partial();
