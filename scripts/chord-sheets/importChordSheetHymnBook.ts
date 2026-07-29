import path from 'path';
import { z } from 'zod';
import { compareHymnNumbers, resolveHymnDisplayNumber } from '../../domain/hymn/hymnNumber';
import { ChordSheetHymn, chordSheetHymnSchema } from '../../schemas/hymn';
import { hymnBookInfoSchema } from '../../schemas/hymnBookInfo';
import { createHymnsIndex } from '../createHymnsIndex';
import { ChordSheetFileSystem } from './chordSheetFileSystem';
import {
  extractObsidianChordContent,
  parseChordSheetFileName,
  selectChordSheetMarkdownFileNames,
} from './parseChordSheetMarkdown';

const chordSheetHymnBookDefinitionSchema = hymnBookInfoSchema.extend({
  idPrefix: z.string().min(1),
});

export type ChordSheetHymnBookDefinition = z.infer<typeof chordSheetHymnBookDefinitionSchema>;

type ImportChordSheetHymnBookParams = {
  definition: ChordSheetHymnBookDefinition;
  destinationDirectory: string;
  fileSystem: ChordSheetFileSystem;
  sourceDirectory: string;
};

function serializeImportedJson(jsonDocument: object): string {
  return `${JSON.stringify(jsonDocument, null, 2)}\n`;
}

async function readChordSheetHymns(
  sourceDirectory: string,
  idPrefix: string,
  fileSystem: ChordSheetFileSystem
): Promise<ChordSheetHymn[]> {
  const sourceFileNames = await fileSystem.listFileNames(sourceDirectory);
  const markdownFileNames = selectChordSheetMarkdownFileNames(sourceFileNames);

  return Promise.all(
    markdownFileNames.map((fileName) =>
      readChordSheetHymn(sourceDirectory, fileName, idPrefix, fileSystem)
    )
  );
}

async function readChordSheetHymn(
  sourceDirectory: string,
  fileName: string,
  idPrefix: string,
  fileSystem: ChordSheetFileSystem
): Promise<ChordSheetHymn> {
  const sourceMarkdown = await fileSystem.readTextFile(path.join(sourceDirectory, fileName));
  const { number, title, variant } = parseChordSheetFileName(fileName);
  const identitySuffix = variant ? `${number}-${variant}` : String(number);

  return chordSheetHymnSchema.parse({
    schemaVersion: 2,
    id: `${idPrefix}-${identitySuffix}`,
    number,
    ...(variant && { variant }),
    title,
    source: {
      format: 'obsidian-chords',
      content: extractObsidianChordContent(sourceMarkdown, fileName),
    },
  });
}

function sortAndValidateHymnIdentities(chordSheetHymns: ChordSheetHymn[]): ChordSheetHymn[] {
  const sortedHymns = [...chordSheetHymns].sort(compareHymnNumbers);
  const duplicateHymn = sortedHymns.find(
    (hymn, index) =>
      hymn.number === sortedHymns[index - 1]?.number &&
      hymn.variant === sortedHymns[index - 1]?.variant
  );

  if (duplicateHymn) {
    const duplicateIdentity = resolveHymnDisplayNumber(duplicateHymn);
    throw new Error(
      `Invalid chord-sheet collection: duplicate hymn identity "${duplicateIdentity}"; expected unique number and variant pairs`
    );
  }

  return sortedHymns;
}

async function writeChordSheetHymnBook(
  destinationDirectory: string,
  hymnBookInfo: z.infer<typeof hymnBookInfoSchema>,
  chordSheetHymns: ChordSheetHymn[],
  fileSystem: ChordSheetFileSystem
): Promise<void> {
  const importedJsonFiles: Array<readonly [string, object]> = [
    ['hymnBookInfo.json', hymnBookInfo],
    ['index.json', createHymnsIndex(chordSheetHymns)],
    ...chordSheetHymns.map((hymn) => [`${resolveHymnDisplayNumber(hymn)}.json`, hymn] as const),
  ];

  await fileSystem.resetDirectory(destinationDirectory);
  await Promise.all(
    importedJsonFiles.map(([fileName, jsonDocument]) =>
      fileSystem.writeTextFile(
        path.join(destinationDirectory, fileName),
        serializeImportedJson(jsonDocument)
      )
    )
  );
}

/**
 * Converts staged Obsidian chord sheets into validated schema-version 2 JSON documents.
 *
 * @example importChordSheetHymnBook({ definition, destinationDirectory, fileSystem, sourceDirectory })
 */
export async function importChordSheetHymnBook({
  definition,
  destinationDirectory,
  fileSystem,
  sourceDirectory,
}: ImportChordSheetHymnBookParams): Promise<number> {
  const validatedDefinition = chordSheetHymnBookDefinitionSchema.parse(definition);
  const { idPrefix, ...hymnBookInfo } = validatedDefinition;
  const importedHymns = await readChordSheetHymns(sourceDirectory, idPrefix, fileSystem);
  const sortedHymns = sortAndValidateHymnIdentities(importedHymns);

  if (sortedHymns.length === 0) {
    throw new Error(
      `Invalid staging directory "${sourceDirectory}"; expected at least one .md file`
    );
  }

  await writeChordSheetHymnBook(destinationDirectory, hymnBookInfo, sortedHymns, fileSystem);

  return sortedHymns.length;
}
