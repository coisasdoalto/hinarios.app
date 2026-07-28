import { describe, expect, it } from '@jest/globals';
import path from 'path';
import { FakeChordSheetFileSystem } from './FakeChordSheetFileSystem';
import { syncChordSheetMarkdownFiles } from './syncChordSheetMarkdownFiles';

describe('syncChordSheetMarkdownFiles', () => {
  it('refreshes the staging directory with Markdown files only', async () => {
    const sourceDirectory = path.resolve('/vault');
    const stagingDirectory = path.resolve('/wip');
    const fileSystem = new FakeChordSheetFileSystem({
      [path.join(sourceDirectory, '1 Meu Prazer.md')]: 'first hymn',
      [path.join(sourceDirectory, 'notes.txt')]: 'not a hymn',
      [path.join(stagingDirectory, 'stale.md')]: 'stale hymn',
    });

    const syncedFileCount = await syncChordSheetMarkdownFiles({
      fileSystem,
      sourceDirectory,
      stagingDirectory,
    });

    expect(syncedFileCount).toBe(1);
    await expect(
      fileSystem.readTextFile(path.join(stagingDirectory, '1 Meu Prazer.md'))
    ).resolves.toBe('first hymn');
    await expect(fileSystem.readTextFile(path.join(stagingDirectory, 'stale.md'))).rejects.toThrow(
      'Missing fake file'
    );
  });

  it('rejects a vault without Markdown files', async () => {
    const sourceDirectory = path.resolve('/empty-vault');
    const fileSystem = new FakeChordSheetFileSystem({
      [path.join(sourceDirectory, 'notes.txt')]: 'not a hymn',
    });

    await expect(
      syncChordSheetMarkdownFiles({
        fileSystem,
        sourceDirectory,
        stagingDirectory: path.resolve('/wip'),
      })
    ).rejects.toThrow(
      `Invalid vault directory "${sourceDirectory}"; expected at least one .md file`
    );
  });
});
