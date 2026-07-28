import { normalizeChordSheetHymn } from '../../chord-sheets/normalizeChordSheetHymn';
import { MusicTheory, tonalMusicTheory } from '../../chord-sheets/musicTheory';
import { normalizeLegacyHymn } from '../../legacy/normalizeLegacyHymn';
import { HymnDocument } from '../../schemas/hymn';
import { assertNever } from '../../utils/assertNever';
import { RenderableHymn } from './renderableHymn.types';

type NormalizeHymnParams = {
  hymn: HymnDocument;
  hymnBookSlug: string;
  musicTheory?: MusicTheory;
};

/**
 * Normalizes every persisted hymn schema through one exhaustive boundary.
 *
 * @example normalizeHymn({ hymn, hymnBookSlug: 'hinos-espirituais' })
 */
export function normalizeHymn({
  hymn,
  hymnBookSlug,
  musicTheory = tonalMusicTheory,
}: NormalizeHymnParams): RenderableHymn {
  switch (hymn.schemaVersion) {
    case 1:
      return normalizeLegacyHymn(hymnBookSlug, hymn);
    case 2:
      return normalizeChordSheetHymn(hymn, musicTheory);
    default:
      return assertNever(hymn);
  }
}
