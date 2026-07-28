import { RenderableHymn } from '../domain/hymn/renderableHymn.types';

/**
 * Flattens normalized hymn sections into the text indexed by search.
 *
 * @example composeHymnSearchBody(normalizedHymn)
 */
export function composeHymnSearchBody(hymn: RenderableHymn): string {
  return hymn.sections
    .map((section) => {
      const sectionText = section.lines.map(({ text }) => text).join('\n');
      return section.number ? `${section.number}. ${sectionText}` : sectionText;
    })
    .join('\n\n');
}
