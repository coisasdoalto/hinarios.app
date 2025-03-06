import fs from 'node:fs/promises';
import path from 'node:path';

import slugify from 'slugify';
import { CommandModule } from 'yargs';
import { z } from 'zod';
import { fs as fszx } from 'zx';

import getParsedData from 'data/getParsedData';
import { joinDataPath } from 'data/joinDataPath';
import { storage } from 'firebase';
import { hymnSchema } from 'schemas/hymn';
import { ReleaseData } from 'types/cli/ReleaseData';

import { logger } from '../logger';

/**
 * @example
 *  "hc/1"
 *  "he/1"
 *  "ccs/1"
 *  "ma/1"
 */
const hymnArgRegex = /^(hc|he|ccs|ma)\/(\d+)/;

const argvSchema = z.object({
  hymn: z
    .string()
    .regex(hymnArgRegex, 'Invalid hymn reference format')
    .transform((hymn) => {
      const [, book, number] = hymn.match(hymnArgRegex)!;

      const hymnBookReference = book.toUpperCase(); // hc -> HC

      const hymnBook = {
        hc: 'hinos-e-canticos',
        he: 'hinos-espirituais',
        ccs: 'corinhos-e-canticos-de-salvacao',
        ma: 'musicas-avulsas',
      }[book];

      return {
        reference: `${hymnBookReference} ${number}`, // HC 1
        book: hymnBook,
        number: Number(number),
      };
    }),
  message: z
    .string({
      required_error: "Message can't be empty",
    })
    .min(1, "Message can't be empty"),
});

const rootPath = path.resolve(__dirname, '..', '..', '..');

const RELEASE_DATA_FILE_NAME = '.release_data';

async function Command(argv: unknown) {
  const update = argvSchema.parse(argv);

  const alreadyExistsReleaseFile = await fszx.pathExists(
    path.resolve(rootPath, RELEASE_DATA_FILE_NAME)
  );

  const currentReleaseData = await (async () => {
    if (!alreadyExistsReleaseFile) return { updates: [] };

    return (await fszx.readJSON(path.resolve(rootPath, RELEASE_DATA_FILE_NAME), {
      encoding: 'utf-8',
    })) as ReleaseData;
  })();

  const hymnFilePath = `${update.hymn.book}/${update.hymn.number}.json`;
  const hymnContentPath = joinDataPath(hymnFilePath);

  const firebaseBucket = storage.bucket();

  await firebaseBucket.upload(hymnContentPath, {
    destination: hymnFilePath,
    metadata: {
      contentType: 'application/json',
    },
  });
  logger.info('File uploaded to Firebase Storage successfully');

  const hymnData = await getParsedData({
    filePath: hymnFilePath,
    schema: hymnSchema,
  });
  const hymnFirstLyric = hymnData.lyrics[0].text.split('\n')[0].replaceAll('"', '');

  const releaseHymnReference = `${update.hymn.reference} (${hymnFirstLyric})`;

  const releaseHymnReferenceWithLinkToHinariosApp = `[${releaseHymnReference}](http://hinarios.app/${
    update.hymn.book
  }/${update.hymn.number}-${slugify(hymnData.title)})`;

  const newReleaseData: ReleaseData = {
    updates: [
      ...currentReleaseData.updates,
      {
        hymn: releaseHymnReferenceWithLinkToHinariosApp,
        message: update.message,
      },
    ],
  };

  const newReleaseFileContent = JSON.stringify(newReleaseData, null, 2);

  await fs.writeFile(path.resolve(rootPath, RELEASE_DATA_FILE_NAME), newReleaseFileContent);

  if (!alreadyExistsReleaseFile) {
    logger.info('Release file created successfully');
    return;
  }

  logger.info('Release file updated successfully');
}

export const UpdateHymnsCommand: CommandModule = {
  command: 'update [hymnReference] [message]',
  describe: 'Update hymn and save changes in release file',
  builder: (yargs) =>
    yargs
      .positional('hymnReference', {
        type: 'string',
        description: `Hymn reference.
        Format: <hymn-book-alias>/<hymn-number>.
        Example: hc/1
        Hymn books alias: 
          - hc: Hino e cânticos
          - he: Hinos espirituais
          - ccs: Corinhos e cânticos de salvação
          - ma: Músicas Avulsas`,
        alias: 'hymn',
      })
      .positional('message', {
        type: 'string',
        description: 'Description of the update to be included in the release notes.',
        alias: 'm',
      }),
  handler: (argv) => Command(argv),
};
