import { z } from 'zod';

export const analyticsQuerySchema =
  z.object({
    from: z.iso.datetime().optional(),

    to: z.iso.datetime().optional(),

    type: z
      .enum(['INCOME', 'EXPENSE'])
      .optional(),
  });

export const categoryTrendsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  category: z.string().trim().optional(),
});
export type AnalyticsQueryInput =
  z.infer<typeof analyticsQuerySchema>;

export type categoryTrendsQueryInput = 
  z.infer<typeof categoryTrendsQuerySchema>