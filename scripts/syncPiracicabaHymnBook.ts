import { nodeChordSheetFileSystem } from './chord-sheets/chordSheetFileSystem';
import { syncChordSheetMarkdownFiles } from './chord-sheets/syncChordSheetMarkdownFiles';
import { PIRACICABA_SOURCE_DIRECTORY, PIRACICABA_STAGING_DIRECTORY } from './piracicabaHymnBook';

syncChordSheetMarkdownFiles({
  fileSystem: nodeChordSheetFileSystem,
  sourceDirectory: PIRACICABA_SOURCE_DIRECTORY,
  stagingDirectory: PIRACICABA_STAGING_DIRECTORY,
})
  .then((syncedFileCount) => {
    console.log(`Copied ${syncedFileCount} Piracicaba chord sheets to wip.`);
  })
  .catch((syncError: unknown) => {
    console.error(syncError);
    process.exitCode = 1;
  });
