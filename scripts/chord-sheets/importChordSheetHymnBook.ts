import path from 'path';
import { z } from 'zod';
import { compareHymnNumbers, resolveHymnDisplayNumber } from '../../domain/hymn/hymnNumber';
import { ChordSheetHymn, chordSheetHymnSchema } from '../../schemas/hymn';
import { hymnBookInfoSchema } from '../../schemas/hymnBookInfo';
import { createHymnsIndex } from '../createHymnsIndex';
import { ChordSheetFileSystem } from './chordSheetFileSystem';
import {
  ChordSheetFileIdentity,
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

type ChordSheetSource = {
  fileName: string;
  identity: ChordSheetFileIdentity;
  sourceMarkdown: string;
};

type NumberedChordSheetSource = ChordSheetSource & {
  identity: ChordSheetFileIdentity & { number: number };
};

const PORTUGUESE_TITLE_COLLATOR = new Intl.Collator('pt-BR', {
  numeric: true,
  sensitivity: 'base',
});

function serializeImportedJson(jsonDocument: object): string {
  return `${JSON.stringify(jsonDocument, null, 2)}\n`;
}

async function readChordSheetSources(
  sourceDirectory: string,
  fileSystem: ChordSheetFileSystem
): Promise<ChordSheetSource[]> {
  const sourceFileNames = await fileSystem.listFileNames(sourceDirectory);
  const markdownFileNames = selectChordSheetMarkdownFileNames(sourceFileNames);

  return Promise.all(
    markdownFileNames.map(async (fileName) => ({
      fileName,
      identity: parseChordSheetFileName(fileName),
      sourceMarkdown: await fileSystem.readTextFile(path.join(sourceDirectory, fileName)),
    }))
  );
}

function hasExplicitNumber(source: ChordSheetSource): source is NumberedChordSheetSource {
  return source.identity.number !== undefined;
}

function compareChordSheetTitles(current: ChordSheetSource, next: ChordSheetSource): number {
  const titleDifference = PORTUGUESE_TITLE_COLLATOR.compare(
    current.identity.title,
    next.identity.title
  );
  return titleDifference || PORTUGUESE_TITLE_COLLATOR.compare(current.fileName, next.fileName);
}

function describeFileNames(sources: ChordSheetSource[]): string {
  return sources.map(({ fileName }) => `"${fileName}"`).join(', ');
}

function rejectMixedNumbering(
  numberedSources: ChordSheetSource[],
  unnumberedSources: ChordSheetSource[]
): never {
  throw new Error(
    `Invalid chord-sheet collection: numbered files [${describeFileNames(
      numberedSources
    )}] and unnumbered files [${describeFileNames(
      unnumberedSources
    )}]; expected either every .md filename to include a number or none`
  );
}

function resolveChordSheetNumbers(sources: ChordSheetSource[]): NumberedChordSheetSource[] {
  const numberedSources = sources.filter(hasExplicitNumber);
  const unnumberedSources = sources.filter((source) => !hasExplicitNumber(source));
  if (numberedSources.length > 0 && unnumberedSources.length > 0) {
    return rejectMixedNumbering(numberedSources, unnumberedSources);
  }
  if (unnumberedSources.length === 0) return numberedSources;

  return [...unnumberedSources].sort(compareChordSheetTitles).map((source, index) => ({
    ...source,
    identity: { ...source.identity, number: index + 1 },
  }));
}

function createChordSheetHymn(
  chordSheetSource: NumberedChordSheetSource,
  idPrefix: string
): ChordSheetHymn {
  const { fileName, identity, sourceMarkdown } = chordSheetSource;
  const { number, title, variant } = identity;
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
  const chordSheetSources = await readChordSheetSources(sourceDirectory, fileSystem);
  const numberedSources = resolveChordSheetNumbers(chordSheetSources);
  const importedHymns = numberedSources.map((source) => createChordSheetHymn(source, idPrefix));
  const sortedHymns = sortAndValidateHymnIdentities(importedHymns);

  if (sortedHymns.length === 0) {
    throw new Error(
      `Invalid staging directory "${sourceDirectory}"; expected at least one .md file`
    );
  }

  await writeChordSheetHymnBook(destinationDirectory, hymnBookInfo, sortedHymns, fileSystem);

  return sortedHymns.length;
}
