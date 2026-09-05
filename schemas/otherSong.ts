import { z } from 'zod';
import { hymnSchema } from './hymn';

export const otherSongSchema = hymnSchema.omit({ number: true }).strict();

export type OtherSong = z.infer<typeof otherSongSchema>;
