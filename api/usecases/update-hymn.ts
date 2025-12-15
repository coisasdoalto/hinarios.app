import { Change, diffLines } from 'diff';
import path from 'node:path';
import { App } from 'octokit';
import slugify from 'slugify';
import { fs } from 'zx';

import getParsedData from 'data/getParsedData';
import { Hymn, hymnSchema } from 'schemas/hymn';
import { storage } from '../../firebase';
import { assertNever } from '../../utils/assertNever';

interface StanzaChange {
  stanzaIndex: number;
  stanzaLabel: string;
  diff: Change[];
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

      if (!oldStanza || !newStanza) return;

      const oldText = oldStanza.text;
      const newText = newStanza.text;

      // Use diffLines to get the diff for this stanza
      const stanzaDiff = diffLines(oldText, newText);

      // Only include if there are actual changes (added or removed)
      const hasChanges = stanzaDiff.some((part) => part.added || part.removed);

      if (!hasChanges) return;

      const stanzaLabel = (() => {
        switch (oldStanza.type) {
          case 'stanza':
            return `Estrofe ${oldStanza.number}`;
          case 'chorus':
            return 'Coro';
          case 'unnumbered_stanza':
            return 'Estrofe sem número';
          default:
            return assertNever(oldStanza);
        }
      })();

      return {
        stanzaIndex: i + 1,
        stanzaLabel,
        diff: stanzaDiff,
      };
    }).filter((c): c is StanzaChange => c !== undefined);

    return changes;
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

      for (const part of change.diff) {
        // Split by lines and format each line
        const lines = part.value.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Skip empty lines at the end
          if (i === lines.length - 1 && line === '') continue;

          if (part.added) {
            body += `  + ${line}\n`;
          } else if (part.removed) {
            body += `  - ${line}\n`;
          } else {
            body += `    ${line}\n`;
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
