import { diff, type IChange } from 'json-diff-ts';
import path from 'node:path';
import { App } from 'octokit';
import slugify from 'slugify';
import { fs } from 'zx';

import getParsedData from 'data/getParsedData';
import { Hymn, hymnSchema } from 'schemas/hymn';
import { stringToAcronym } from 'utils/stringToAcronym';
import { storage } from '../../firebase/';
import { assertNever } from '../../utils/assertNever';

interface StanzaChange {
  stanzaIndex: number;
  stanzaLabel: string;
  oldStanza?: Hymn['lyrics'][number];
  newStanza?: Hymn['lyrics'][number];
  changes: IChange[];
}

class UpdateHymnUsecase {
  private GITHUB_APP_ID = process.env.GITHUB_APP_ID;
  private GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY;
  private GITHUB_APP_INSTALLATION_ID = process.env.GITHUB_APP_INSTALLATION_ID;

  async execute(params: {
    hymnBook: string;
    hymnNumber: number;
    title: string;
    subtitle: string;
    lyrics: Hymn['lyrics'];
    message?: string;
  }) {
    const { hymnBook, hymnNumber, title, subtitle, lyrics, message } = params;

    const hymnFilePath = path.join(hymnBook, `${hymnNumber}.json`);
    const resolvedHymnDataPath = path.resolve('hymnsData', hymnFilePath);

    const hymnDataFileExists = await fs.exists(resolvedHymnDataPath);

    if (!hymnDataFileExists)
      throw new Error('Hymn not found', {
        cause: 'HymnNotFound',
      });

    const existingHymnData = await getParsedData({
      filePath: path.join(hymnBook, `${hymnNumber}.json`),
      schema: hymnSchema,
    });

    const updatedHymnData: Hymn = {
      ...existingHymnData,
      title,
      subtitle,
      lyrics,
    };

    const lyricChanges = this.generateLyricsDiff(existingHymnData, updatedHymnData);

    const firebaseBucket = storage.bucket();

    await firebaseBucket.file(hymnFilePath).save(JSON.stringify(updatedHymnData, null, 2), {
      contentType: 'application/json',
    });

    // Create GitHub release if there are changes
    if (lyricChanges.length === 0) return;

    try {
      const releaseTitle = new Date()
        .toISOString()
        .replace(/T/, '-')
        .replace(/\..+/, '')
        .replace(/:/g, '-');

      const releaseBody = this.generateReleaseBody({
        hymnBook,
        hymnNumber,
        hymnTitle: title,
        changes: lyricChanges,
        message,
      });

      await this.createGithubRelease(releaseTitle, releaseBody);
    } catch (error) {
      console.error(error);
      // Don't fail the request if release creation fails
    }
  }

  private generateLyricsDiff(oldHymn: Hymn, newHymn: Hymn): StanzaChange[] {
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

  private getStanzaLabel(stanza: Hymn['lyrics'][number]): string {
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
  private generateReleaseBody({
    hymnBook,
    hymnNumber,
    hymnTitle,
    changes,
    message,
  }: {
    hymnBook: string;
    hymnNumber: number;
    hymnTitle: string;
    changes: StanzaChange[];
    message?: string;
  }): string {
    const hymnSlug = `${hymnNumber}-${slugify(hymnTitle)}`;
    const hymnUrl = `http://hinarios.app/${hymnBook}/${hymnSlug}`;

    const bookAlias = stringToAcronym(hymnBook);
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

  private async createGithubRelease(title: string, body: string): Promise<void> {
    if (!this.GITHUB_APP_ID || !this.GITHUB_APP_PRIVATE_KEY || !this.GITHUB_APP_INSTALLATION_ID) {
      console.error('GitHub App credentials are not set', {
        GITHUB_APP_ID: Boolean(this.GITHUB_APP_ID),
        GITHUB_APP_PRIVATE_KEY: Boolean(this.GITHUB_APP_PRIVATE_KEY),
        GITHUB_APP_INSTALLATION_ID: Boolean(this.GITHUB_APP_INSTALLATION_ID),
      });
      return;
    }

    const app = new App({
      appId: this.GITHUB_APP_ID,
      privateKey: this.GITHUB_APP_PRIVATE_KEY,
    });

    const octokit = await app.getInstallationOctokit(Number(this.GITHUB_APP_INSTALLATION_ID));

    const releaseData = {
      tag_name: title,
      name: title,
      body,
      draft: false,
      prerelease: false,
    };

    await octokit.request('POST /repos/{owner}/{repo}/releases', {
      owner: 'coisasdoalto',
      repo: 'hinarios.app',
      ...releaseData,
    });
  }
}

export const updateHymnUsecase = new UpdateHymnUsecase();
