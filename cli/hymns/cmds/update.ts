import fs from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import { fs as fszx } from 'zx';

import { ReleaseData } from 'types/cli/release-data';
import { CommandModule } from 'yargs';
import { logger } from '../logger';

/**
 * @example
 *  "hc/1"
 *  "he/1"
 *  "ccs/1"
 */
const hymnArgRegex = /^(hc|he|ccs)\/(\d)/;

const argvSchema = z.object({
  hymnReference: z
    .string()
    .regex(hymnArgRegex, 'Invalid hymn reference format')
    .transform((hymn) => {
      const [, book, number] = hymn.match(hymnArgRegex)!;

      const hymnBook = book.toUpperCase(); // hc -> HC

      return `${hymnBook} ${number}`; // HC 1
    }),
  message: z.string().min(1, "Message can't be empty"),
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

  const releaseData: ReleaseData = {
    updates: [
      ...currentReleaseData.updates,
      {
        hymn: update.hymnReference,
        message: update.message,
      },
    ],
  };

  const releaseFileContent = JSON.stringify(releaseData, null, 2);

  await fs.writeFile(path.resolve(rootPath, '.release_data'), releaseFileContent);

  if (!alreadyExistsReleaseFile) {
    logger.blue('info', 'Release file created successfully');
    return;
  }

  logger.blue('info', 'Release file updated successfully');
}

export const UpdateHymnsCommand: CommandModule = {
  command: 'update <hymnReference>',
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
          - ccs: Corinhos e cânticos de salvação`,
      })
      .option('message', {
        description: 'Update message. This is will be included in release',
        alias: 'm',
      }),
  handler: (argv) => Command(argv),
};
