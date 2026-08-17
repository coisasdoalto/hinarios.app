import path from 'path';
import { ChordSheetHymnBookDefinition } from './chord-sheets/importChordSheetHymnBook';

/**
 * Requires the Piracicaba vault path used by the local synchronization command.
 * @example requirePiracicabaSourceDirectory('/vault/piracicaba')
 */
export function requirePiracicabaSourceDirectory(configuredPath: string | undefined): string {
  if (configuredPath) return configuredPath;

  throw new Error(
    `Invalid PIRACICABA_HYMN_BOOK_PATH "${String(
      configuredPath
    )}"; expected a path to the Piracicaba Obsidian vault`
  );
}

export const PIRACICABA_STAGING_DIRECTORY = path.resolve('wip', 'hinario-piracicaba');

export const PIRACICABA_DESTINATION_DIRECTORY = path.resolve('hymnsData', 'ev-beta');

export const PIRACICABA_HYMN_BOOK_DEFINITION: ChordSheetHymnBookDefinition = {
  idPrefix: 'ev-beta',
  name: 'Em Espírito, Em Verdade',
  displayName: 'EV (beta)',
  acronym: 'EV',
};
