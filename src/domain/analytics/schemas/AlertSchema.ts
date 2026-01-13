/**
 * Alert Schema
 * Validation Zod pour les entités Alert
 */

import { z } from 'zod';

export const AlertSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.string(),
  category: z.string(),
  status: z.enum(['active', 'snoozed', 'resolved']),
  priority: z.enum(['low', 'medium', 'high']),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
  assignedTo: z.string().optional().nullable(),
  kpiId: z.string().optional(),
  bureauId: z.string().optional(),
  affectedBureaux: z.array(z.string()),
  metric: z.string(),
  currentValue: z.number(),
  targetValue: z.number(),
  unit: z.string(),
  recommendation: z.string().optional(),
  impact: z.string().optional(),
});

// Type inference
export type Alert = z.infer<typeof AlertSchema>;

/**
 * Valide une alerte
 */
export function validateAlert(data: unknown): Alert {
  try {
    return AlertSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid alert data', error.errors);
    }
    throw error;
  }
}

/**
 * Valide un tableau d'alertes
 */
export function validateAlertArray(data: unknown): Alert[] {
  try {
    return z.array(AlertSchema).parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid alert array', error.errors);
    }
    throw error;
  }
}

// ValidationError est exporté depuis PeriodSchema
export { ValidationError } from './PeriodSchema';

