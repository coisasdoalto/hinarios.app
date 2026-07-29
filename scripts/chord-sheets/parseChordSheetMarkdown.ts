const REVIEW_STATUS_SUFFIX = /\s+(?:(?:✔\uFE0F?)|🆗|❓)+$/u;
const CHORDS_OPENING_FENCE = /^```chords[^\S\r\n]*\r?\n/u;
const MARKDOWN_CLOSING_FENCE = /\r?\n```[^\S\r\n]*(?:\r?\n|$)/u;

export type ChordSheetFileIdentity = {
  number: number;
  title: string;
  variant?: string;
};

/**
 * Selects deterministic Markdown inputs from a vault directory listing.
 *
 * @example selectChordSheetMarkdownFileNames(['notes.txt', '1 Example.md'])
 */
export function selectChordSheetMarkdownFileNames(fileNames: string[]): string[] {
  return fileNames.filter((fileName) => fileName.endsWith('.md')).sort();
}

/**
 * Reads the hymn number and title from a Piracicaba vault filename.
 *
 * @example parseChordSheetFileName('1 Meu Prazer 🆗.md')
 */
export function parseChordSheetFileName(fileName: string): ChordSheetFileIdentity {
  const fileNameMatch = /^(\d+)(?:\.([a-z0-9]+))?\s+(.+)\.md$/iu.exec(fileName);
  if (!fileNameMatch) {
    throw new Error(
      `Invalid chord-sheet filename "${fileName}"; expected "<number>[.<variant>] <title>.md"`
    );
  }

  const title = fileNameMatch[3].replace(REVIEW_STATUS_SUFFIX, '').trim();
  if (!title) {
    throw new Error(`Invalid chord-sheet filename "${fileName}"; expected a non-empty hymn title`);
  }

  const variant = fileNameMatch[2]?.toLocaleLowerCase('en-US');
  return { number: Number(fileNameMatch[1]), title, ...(variant && { variant }) };
}

/**
 * Extracts the canonical source inside a Markdown chords fence.
 *
 * @example extractObsidianChordContent('```chords\nTOM %G\n```', '1 Example.md')
 */
export function extractObsidianChordContent(sourceMarkdown: string, fileName: string): string {
  const openingFence = CHORDS_OPENING_FENCE.exec(sourceMarkdown);
  if (!openingFence) {
    throw new Error(`Invalid chord sheet "${fileName}"; expected an opening \`\`\`chords fence`);
  }

  const contentWithOptionalFence = sourceMarkdown.slice(openingFence[0].length);
  const closingFenceIndex = contentWithOptionalFence.search(MARKDOWN_CLOSING_FENCE);
  const chordContent =
    closingFenceIndex === -1
      ? contentWithOptionalFence
      : contentWithOptionalFence.slice(0, closingFenceIndex);

  if (!chordContent.trim()) {
    throw new Error(`Invalid chord sheet "${fileName}"; expected non-empty chords content`);
  }

  return chordContent;
}
