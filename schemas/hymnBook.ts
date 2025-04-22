import { z } from 'zod';
import { hymnsIndexSchema } from './hymnsIndex';

export const hymnBookSchema = z.object({
  slug: z.string(),
  name: z.string(),
  index: hymnsIndexSchema.optional(),
});

export type HymnBook = z.infer<typeof hymnBookSchema>;
