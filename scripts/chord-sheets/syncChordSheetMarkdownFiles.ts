import path from 'path';
import { ChordSheetFileSystem } from './chordSheetFileSystem';
import { selectChordSheetMarkdownFileNames } from './parseChordSheetMarkdown';

type SyncChordSheetMarkdownFilesParams = {
  fileSystem: ChordSheetFileSystem;
  sourceDirectory: string;
  stagingDirectory: string;
};

/**
 * Refreshes an ignored staging directory with the Markdown files from a local vault.
 *
 * @example syncChordSheetMarkdownFiles({ fileSystem, sourceDirectory, stagingDirectory })
 */
export async function syncChordSheetMarkdownFiles({
  fileSystem,
  sourceDirectory,
  stagingDirectory,
}: SyncChordSheetMarkdownFilesParams): Promise<number> {
  const sourceFileNames = await fileSystem.listFileNames(sourceDirectory);
  const markdownFileNames = selectChordSheetMarkdownFileNames(sourceFileNames);

  if (markdownFileNames.length === 0) {
    throw new Error(`Invalid vault directory "${sourceDirectory}"; expected at least one .md file`);
  }

  await fileSystem.resetDirectory(stagingDirectory);
  await Promise.all(
    markdownFileNames.map((fileName) =>
      fileSystem.copyTextFile(
        path.join(sourceDirectory, fileName),
        path.join(stagingDirectory, fileName)
      )
    )
  );

  return markdownFileNames.length;
}
