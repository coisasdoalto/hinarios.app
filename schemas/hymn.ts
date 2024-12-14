import { z } from 'zod';

export const hymnSchema = z.object({
  number: z.number().or(z.string()),
  title: z.string(),
  subtitle: z.string().optional(),
  lyrics: z.array(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('stanza'),
        number: z.number(),
        text: z.string(),
      }),
      z.object({
        type: z.literal('chorus'),
        text: z.string(),
      }),
      z.object({
        type: z.literal('unnumbered_stanza'),
        text: z.string(),
      }),
    ])
  ),
});

export type Hymn = z.infer<typeof hymnSchema>;

export type HymnLyricStanzaType = Extract<Hymn['lyrics'][number], { type: 'stanza' }>;
export type HymnLyricChorusType = Extract<Hymn['lyrics'][number], { type: 'chorus' }>;
