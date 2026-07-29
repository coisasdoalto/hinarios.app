import { homedir } from 'os';
import path from 'path';
import { ChordSheetHymnBookDefinition } from './chord-sheets/importChordSheetHymnBook';

export const PIRACICABA_SOURCE_DIRECTORY =
  process.env.PIRACICABA_HYMN_BOOK_PATH

export const PIRACICABA_STAGING_DIRECTORY = path.resolve('wip', 'hinario-piracicaba');

export const PIRACICABA_DESTINATION_DIRECTORY = path.resolve('hymnsData', 'em-espirito-em-verdade');

export const PIRACICABA_HYMN_BOOK_DEFINITION: ChordSheetHymnBookDefinition = {
  idPrefix: 'em-espirito-em-verdade',
  name: 'Em Espírito, Em Verdade',
  displayName: 'Em Espírito, Em Verdade (beta)',
  acronym: 'EV',
};
