import { HymnDocument } from '../schemas/hymn';
import { RenderableHymn, RenderableSection } from '../domain/hymn/renderableHymn.types';

type LegacyHymnDocument = Extract<HymnDocument, { schemaVersion: 1 }>;

function normalizeLegacySection(
  hymnId: string,
  legacySection: LegacyHymnDocument['lyrics'][number],
  sectionIndex: number
): RenderableSection {
  const sectionId = `${hymnId}/section-${sectionIndex + 1}`;
  const lines = legacySection.text.split('\n').map((text, lineIndex) => ({
    id: `${sectionId}/line-${lineIndex + 1}`,
    text,
  }));

  if (legacySection.type === 'stanza') {
    return { id: sectionId, type: 'stanza', number: legacySection.number, lines };
  }
  if (legacySection.type === 'chorus') {
    return { id: sectionId, type: 'chorus', lines };
  }

  return { id: sectionId, type: 'unnumbered', lines };
}

/**
 * Adapts an implicit-version legacy hymn to the shared presentation model.
 *
 * @example normalizeLegacyHymn('legacy-book', legacyHymn)
 */
export function normalizeLegacyHymn(
  hymnBookSlug: string,
  legacyHymn: LegacyHymnDocument
): RenderableHymn {
  const hymnId = `${hymnBookSlug}/${legacyHymn.number}`;

  return {
    id: hymnId,
    number: String(legacyHymn.number),
    title: legacyHymn.title,
    ...(legacyHymn.subtitle && { subtitle: legacyHymn.subtitle }),
    editable: true,
    sections: legacyHymn.lyrics.map((section, sectionIndex) =>
      normalizeLegacySection(hymnId, section, sectionIndex)
    ),
  };
}
