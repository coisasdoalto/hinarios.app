import { describe, expect, it } from '@jest/globals';
import path from 'path';
import { FakeChordSheetFileSystem } from './FakeChordSheetFileSystem';
import { importChordSheetHymnBook } from './importChordSheetHymnBook';

const hymnBookDefinition = {
  idPrefix: 'em-espirito-em-verdade',
  name: 'Em Espírito, Em Verdade',
  displayName: 'Em Espírito, Em Verdade (beta)',
  acronym: 'EV',
};

describe('importChordSheetHymnBook', () => {
  it('writes sorted schema-version 2 hymns and display metadata', async () => {
    const sourceDirectory = path.resolve('/wip');
    const destinationDirectory = path.resolve('/hymnsData/em-espirito-em-verdade');
    const fileSystem = new FakeChordSheetFileSystem({
      [path.join(sourceDirectory, '2 Adoramos ❓.md')]: '```chords\nTOM %G\n\nG\nAdoramos',
      [path.join(sourceDirectory, '1 Meu Prazer 🆗.md')]:
        '```chords\nTOM %G\n\nG\nMeu prazer\n```\n<div>page break</div>',
      [path.join(destinationDirectory, 'stale.json')]: '{}',
    });

    const importedHymnCount = await importChordSheetHymnBook({
      definition: hymnBookDefinition,
      destinationDirectory,
      fileSystem,
      sourceDirectory,
    });

    expect(importedHymnCount).toBe(2);
    await expect(
      fileSystem.readTextFile(path.join(destinationDirectory, 'hymnBookInfo.json'))
    ).resolves.toBe(
      `${JSON.stringify(
        {
          name: 'Em Espírito, Em Verdade',
          displayName: 'Em Espírito, Em Verdade (beta)',
          acronym: 'EV',
        },
        null,
        2
      )}\n`
    );
    await expect(
      fileSystem.readTextFile(path.join(destinationDirectory, '1.json'))
    ).resolves.toContain('"id": "em-espirito-em-verdade-1"');
    await expect(
      fileSystem.readTextFile(path.join(destinationDirectory, '1.json'))
    ).resolves.toContain('"content": "TOM %G\\n\\nG\\nMeu prazer"');
    await expect(
      fileSystem.readTextFile(path.join(destinationDirectory, 'index.json'))
    ).resolves.toContain('"slug": "1-Meu-Prazer"');
    await expect(
      fileSystem.readTextFile(path.join(destinationDirectory, 'stale.json'))
    ).rejects.toThrow('Missing fake file');
  });

  it('rejects duplicate hymn numbers before writing the destination', async () => {
    const sourceDirectory = path.resolve('/wip');
    const destinationDirectory = path.resolve('/hymnsData/em-espirito-em-verdade');
    const fileSystem = new FakeChordSheetFileSystem({
      [path.join(sourceDirectory, '1 First.md')]: '```chords\nTOM %G',
      [path.join(sourceDirectory, '1 Second.md')]: '```chords\nTOM %C',
    });

    await expect(
      importChordSheetHymnBook({
        definition: hymnBookDefinition,
        destinationDirectory,
        fileSystem,
        sourceDirectory,
      })
    ).rejects.toThrow(
      'Invalid chord-sheet collection: duplicate hymn number "1"; expected unique numbers'
    );
  });
});
