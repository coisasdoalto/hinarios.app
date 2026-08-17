import { RenderableHymn } from '../domain/hymn/renderableHymn.types';
import { resolveHymnDisplayNumber } from '../domain/hymn/hymnNumber';
import { ChordSheetHymn } from '../schemas/hymn';
import { MusicTheory, tonalMusicTheory } from './musicTheory';
import { parseChordSheet } from './parseChordSheet';

/**
 * Adapts a schema-version 2 chord sheet to the shared presentation model.
 *
 * @example normalizeChordSheetHymn(chordSheetHymn)
 */
export function normalizeChordSheetHymn(
  chordSheetHymn: ChordSheetHymn,
  musicTheory: MusicTheory = tonalMusicTheory
): RenderableHymn {
  const parsedChordSheet = parseChordSheet(
    chordSheetHymn.source.content,
    chordSheetHymn.id,
    musicTheory
  );

  return {
    id: chordSheetHymn.id,
    number: String(resolveHymnDisplayNumber(chordSheetHymn)),
    title: chordSheetHymn.title,
    ...(chordSheetHymn.subtitle && { subtitle: chordSheetHymn.subtitle }),
    ...(chordSheetHymn.reference && { reference: chordSheetHymn.reference }),
    editable: false,
    sections: parsedChordSheet.sections,
    musical: {
      ...(parsedChordSheet.originalKey && { originalKey: parsedChordSheet.originalKey }),
      transposable: true,
    },
  };
}
