import { z } from 'zod';

export const analyticsQuerySchema =
  z.object({
    from: z.iso.datetime().optional(),

    to: z.iso.datetime().optional(),

    type: z
      .enum(['INCOME', 'EXPENSE'])
      .optional(),
  });

export type AnalyticsQueryInput =
  z.infer<typeof analyticsQuerySchema>;