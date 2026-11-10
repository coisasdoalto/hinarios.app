import { diff, type IChange } from 'json-diff-ts';
import slugify from 'slugify';
import { Hymn } from 'schemas/hymn';
import { assertNever } from 'utils/assertNever';
import { stringToAcronym } from 'utils/stringToAcronym';

/**
 * Pure helpers copied from api_src/usecases/update-hymn.ts so the Pages Function can use them
 * without the Node-only dependencies of the original usecase.
 */
interface StanzaChange {
  stanzaIndex: number;
  stanzaLabel: string;
  oldStanza?: Hymn['lyrics'][number];
  newStanza?: Hymn['lyrics'][number];
  changes: IChange[];
}

class HymnChanges {
  generateLyricsDiff(oldHymn: Hymn, newHymn: Hymn): StanzaChange[] {
    const maxStanzas = Math.max(oldHymn.lyrics.length, newHymn.lyrics.length);

    const changes = Array.from({ length: maxStanzas }, (_, i) => {
      const oldStanza = oldHymn.lyrics[i];
      const newStanza = newHymn.lyrics[i];

      // Handle added stanza (exists in new but not in old)
      if (!oldStanza && newStanza) {
        const stanzaLabel = this.getStanzaLabel(newStanza);
        return {
          stanzaIndex: i + 1,
          stanzaLabel: `${stanzaLabel} (adicionada)`,
          newStanza,
          changes: [{ type: 'ADD', key: 'text', value: newStanza.text }] as IChange[],
        };
      }

      // Handle removed stanza (exists in old but not in new)
      if (oldStanza && !newStanza) {
        const stanzaLabel = this.getStanzaLabel(oldStanza);
        return {
          stanzaIndex: i + 1,
          stanzaLabel: `${stanzaLabel} (removida)`,
          oldStanza,
          changes: [{ type: 'REMOVE', key: 'text', value: oldStanza.text }] as IChange[],
        };
      }

      // Both exist, check for changes
      if (!oldStanza || !newStanza) return;

      // Use json-diff-ts to get the diff for this stanza
      const stanzaDiff = diff(oldStanza, newStanza);

      // Only include if there are actual changes
      if (stanzaDiff.length === 0) return;

      const typeChanged = oldStanza.type !== newStanza.type;
      const oldStanzaLabel = this.getStanzaLabel(oldStanza);
      const newStanzaLabel = this.getStanzaLabel(newStanza);

      const stanzaLabel = typeChanged ? `${oldStanzaLabel} → ${newStanzaLabel}` : newStanzaLabel;

      return {
        stanzaIndex: i + 1,
        stanzaLabel,
        oldStanza,
        newStanza,
        changes: stanzaDiff,
      };
    }).filter((c) => c !== undefined) as StanzaChange[];

    return changes;
  }

  getStanzaLabel(stanza: Hymn['lyrics'][number]): string {
    switch (stanza.type) {
      case 'stanza':
        return `Estrofe ${stanza.number}`;
      case 'chorus':
        return 'Coro';
      case 'unnumbered_stanza':
        return 'Estrofe sem número';
      default:
        return assertNever(stanza);
    }
  }

  /**
   * Template:
   # Ajustes de conteúdo

   - [HC 123 (Nome do Hino)](http://hinarios.app/...): Mensagem opcional

    **Estrofe 1:**
    ```diff
    - linha antiga
    + linha nova
      linha comum
    ```
   */
  generateReleaseBody({
    hymnBook,
    hymnBookName,
    hymnNumber,
    hymnTitle,
    changes,
    message,
  }: {
    hymnBook: string;
    /** Display name, such as "Hinos e Cânticos"; the slug has no capitals to build the acronym from. */
    hymnBookName?: string;
    hymnNumber: number;
    hymnTitle: string;
    changes: StanzaChange[];
    message?: string;
  }): string {
    const hymnSlug = `${hymnNumber}-${slugify(hymnTitle)}`;
    const hymnUrl = `https://hinarios.app/${hymnBook}/${hymnSlug}/`;

    const bookAlias = stringToAcronym(hymnBookName ?? hymnBook) || hymnBook;
    const hymnReference = `[${bookAlias} ${hymnNumber} (${hymnTitle})](${hymnUrl})`;

    let body = `# Ajustes de conteúdo\n\n`;
    body += `- ${hymnReference}`;
    if (message) {
      body += `: ${message}`;
    }
    body += `\n\n`;

    for (const change of changes) {
      body += `  **${change.stanzaLabel}:**\n`;
      body += '  ```diff\n';

      // Handle added stanza
      if (!change.oldStanza && change.newStanza) {
        const lines = change.newStanza.text.split('\n');
        for (const line of lines) {
          body += `  + ${line}\n`;
        }
      }
      // Handle removed stanza

      if (change.oldStanza && !change.newStanza) {
        const lines = change.oldStanza.text.split('\n');
        for (const line of lines) {
          body += `  - ${line}\n`;
        }
      }
      // Handle updated stanza

      if (change.oldStanza && change.newStanza) {
        // Show the changes using json-diff-ts results
        for (const diffItem of change.changes) {
          if (diffItem.type === 'UPDATE' && diffItem.key === 'text') {
            // For text updates, show line-by-line comparison
            const oldLines = (diffItem.oldValue as string).split('\n');
            const newLines = (diffItem.value as string).split('\n');

            for (const line of oldLines) {
              body += `  - ${line}\n`;
            }
            for (const line of newLines) {
              body += `  + ${line}\n`;
            }
          }
        }
      }

      body += '  ```\n\n';
    }

    return body;
  }
}

export const hymnChanges = new HymnChanges();
export type { StanzaChange };
