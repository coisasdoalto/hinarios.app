import { z } from 'zod';

export const legacyHymnSchema = z.object({
  number: z.number().or(z.string()),
  title: z.string(),
  subtitle: z.string().optional(),
  originalAuthor: z.string().optional(),
  originalNumber: z.number().or(z.string()).optional(),
  originalTitle: z.string().optional(),
  showStanzaNumbers: z.boolean().optional(),
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

export const hymnSchema = legacyHymnSchema;

export const chordSheetHymnSchema = z.object({
  schemaVersion: z.literal(2),
  id: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  source: z.object({
    format: z.literal('obsidian-chords'),
    content: z.string().min(1),
  }),
});

const versionedLegacyHymnSchema = legacyHymnSchema.extend({
  schemaVersion: z.literal(1),
});
const versionedHymnDocumentSchema = z.discriminatedUnion('schemaVersion', [
  versionedLegacyHymnSchema,
  chordSheetHymnSchema,
]);

export type Hymn = z.infer<typeof legacyHymnSchema>;
export type HymnDocument = z.infer<typeof versionedHymnDocumentSchema>;
export type ChordSheetHymn = z.infer<typeof chordSheetHymnSchema>;

/**
 * Adds the implicit legacy schema version at the document boundary.
 *
 * @example applyDefaultSchemaVersion({ number: 1, title: 'Example', lyrics: [] })
 */
export function applyDefaultSchemaVersion(rawHymn: unknown): unknown {
  if (typeof rawHymn !== 'object' || rawHymn === null || 'schemaVersion' in rawHymn) {
    return rawHymn;
  }

  return { ...rawHymn, schemaVersion: 1 };
}

export const hymnDocumentSchema: z.ZodType<HymnDocument, z.ZodTypeDef, unknown> = z.preprocess(
  applyDefaultSchemaVersion,
  versionedHymnDocumentSchema
);

export type HymnLyricStanzaType = Extract<Hymn['lyrics'][number], { type: 'stanza' }>;
export type HymnLyricChorusType = Extract<Hymn['lyrics'][number], { type: 'chorus' }>;
