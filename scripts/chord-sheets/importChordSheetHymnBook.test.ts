import { describe, expect, it } from '@jest/globals';
import path from 'path';
import { FakeChordSheetFileSystem } from './FakeChordSheetFileSystem';
import { importChordSheetHymnBook } from './importChordSheetHymnBook';

const hymnBookDefinition = {
  idPrefix: 'ev-beta',
  name: 'Em Espírito, Em Verdade',
  displayName: 'Em Espírito, Em Verdade (beta)',
  acronym: 'EV',
};

describe('importChordSheetHymnBook', () => {
  it('writes sorted schema-version 2 hymns and display metadata', async () => {
    const sourceDirectory = path.resolve('/wip');
    const destinationDirectory = path.resolve('/hymnsData/ev-beta');
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
    ).resolves.toContain('"id": "ev-beta-1"');
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

  it('numbers an unnumbered collection in Portuguese alphabetical order', async () => {
    const sourceDirectory = path.resolve('/wip');
    const destinationDirectory = path.resolve('/hymnsData/ev-beta');
    const fileSystem = new FakeChordSheetFileSystem({
      [path.join(sourceDirectory, 'Zelo.md')]: '```chords\nTOM %G\n\nG\nZelo',
      [path.join(sourceDirectory, 'Amor.md')]: '```chords\nTOM %C\n\nC\nAmor',
      [path.join(sourceDirectory, 'Água Viva.md')]: '```chords\nTOM %D\n\nD\nÁgua Viva',
    });

    await importChordSheetHymnBook({
      definition: hymnBookDefinition,
      destinationDirectory,
      fileSystem,
      sourceDirectory,
    });

    await expect(
      fileSystem.readTextFile(path.join(destinationDirectory, '1.json'))
    ).resolves.toContain('"title": "Água Viva"');
    await expect(
      fileSystem.readTextFile(path.join(destinationDirectory, '2.json'))
    ).resolves.toContain('"title": "Amor"');
    await expect(
      fileSystem.readTextFile(path.join(destinationDirectory, '3.json'))
    ).resolves.toContain('"title": "Zelo"');
  });

  it('rejects a collection that mixes numbered and unnumbered filenames', async () => {
    const sourceDirectory = path.resolve('/wip');
    const destinationDirectory = path.resolve('/hymnsData/ev-beta');
    const fileSystem = new FakeChordSheetFileSystem({
      [path.join(sourceDirectory, '1 First.md')]: '```chords\nTOM %G',
      [path.join(sourceDirectory, 'Second.md')]: '```chords\nTOM %C',
    });

    await expect(
      importChordSheetHymnBook({
        definition: hymnBookDefinition,
        destinationDirectory,
        fileSystem,
        sourceDirectory,
      })
    ).rejects.toThrow(
      'Invalid chord-sheet collection: numbered files ["1 First.md"] and unnumbered files ["Second.md"]; expected either every .md filename to include a number or none'
    );
  });

  it('rejects duplicate hymn identities before writing the destination', async () => {
    const sourceDirectory = path.resolve('/wip');
    const destinationDirectory = path.resolve('/hymnsData/ev-beta');
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
      'Invalid chord-sheet collection: duplicate hymn identity "1"; expected unique number and variant pairs'
    );
  });

  it('writes same-number variants as independent sorted entries', async () => {
    const sourceDirectory = path.resolve('/wip');
    const destinationDirectory = path.resolve('/hymnsData/ev-beta');
    const fileSystem = new FakeChordSheetFileSystem({
      [path.join(sourceDirectory, '73 Next.md')]: '```chords\nTOM %G\n\nG\nNext',
      [path.join(sourceDirectory, '72.b Maranata (Versão Acampa) 🆗.md')]:
        '```chords\nTOM %E\n\nE\nMaranata B',
      [path.join(sourceDirectory, '72.a Maranata 🆗.md')]: '```chords\nTOM %E\n\nE\nMaranata A',
      [path.join(sourceDirectory, '71 Previous.md')]: '```chords\nTOM %C\n\nC\nPrevious',
    });

    await importChordSheetHymnBook({
      definition: hymnBookDefinition,
      destinationDirectory,
      fileSystem,
      sourceDirectory,
    });

    await expect(
      fileSystem.readTextFile(path.join(destinationDirectory, '72a.json'))
    ).resolves.toContain('"id": "ev-beta-72-a"');
    await expect(
      fileSystem.readTextFile(path.join(destinationDirectory, '72b.json'))
    ).resolves.toContain('"variant": "b"');
    await expect(
      fileSystem.readTextFile(path.join(destinationDirectory, 'index.json'))
    ).resolves.toContain('"slug": "72a-Maranata"');
  });
});
