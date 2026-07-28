import { nodeChordSheetFileSystem } from './chord-sheets/chordSheetFileSystem';
import { importChordSheetHymnBook } from './chord-sheets/importChordSheetHymnBook';
import {
  PIRACICABA_DESTINATION_DIRECTORY,
  PIRACICABA_HYMN_BOOK_DEFINITION,
  PIRACICABA_STAGING_DIRECTORY,
} from './piracicabaHymnBook';

importChordSheetHymnBook({
  definition: PIRACICABA_HYMN_BOOK_DEFINITION,
  destinationDirectory: PIRACICABA_DESTINATION_DIRECTORY,
  fileSystem: nodeChordSheetFileSystem,
  sourceDirectory: PIRACICABA_STAGING_DIRECTORY,
})
  .then((importedHymnCount) => {
    console.log(`Imported ${importedHymnCount} hymns into hymnsData/em-espirito-em-verdade.`);
  })
  .catch((importError: unknown) => {
    console.error(importError);
    process.exitCode = 1;
  });
