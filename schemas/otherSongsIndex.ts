import { z } from 'zod';

export const otherSongsIndexSchema = z.array(
  z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    slug: z.string(),
  })
);

export type OtherSongsIndex = z.infer<typeof otherSongsIndexSchema>;
