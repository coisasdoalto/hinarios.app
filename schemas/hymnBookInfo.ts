import { z } from 'zod';

export const hymnBookInfoSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1).optional(),
  acronym: z.string().min(1).optional(),
});

export type HymnBookInfo = z.infer<typeof hymnBookInfoSchema>;

/**
 * Applies an optional display-name override while retaining the remaining book metadata.
 *
 * @example resolveHymnBookDisplayName({ name: 'Original', displayName: 'Beta' })
 */
export function resolveHymnBookDisplayName(hymnBookInfo: HymnBookInfo): HymnBookInfo {
  if (!hymnBookInfo.displayName) {
    return hymnBookInfo;
  }

  return { ...hymnBookInfo, name: hymnBookInfo.displayName };
}
