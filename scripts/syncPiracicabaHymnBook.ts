import { nodeChordSheetFileSystem } from './chord-sheets/chordSheetFileSystem';
import { syncChordSheetMarkdownFiles } from './chord-sheets/syncChordSheetMarkdownFiles';
import {
  PIRACICABA_STAGING_DIRECTORY,
  requirePiracicabaSourceDirectory,
} from './piracicabaHymnBook';

syncChordSheetMarkdownFiles({
  fileSystem: nodeChordSheetFileSystem,
  sourceDirectory: requirePiracicabaSourceDirectory(process.env.PIRACICABA_HYMN_BOOK_PATH),
  stagingDirectory: PIRACICABA_STAGING_DIRECTORY,
})
  .then((syncedFileCount) => {
    console.log(`Copied ${syncedFileCount} Piracicaba chord sheets to wip.`);
  })
  .catch((syncError: unknown) => {
    console.error(syncError);
    process.exitCode = 1;
  });
