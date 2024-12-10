import path from 'node:path';

import { $, fs as fszx, useBash, which } from 'zx';

import { ReleaseData } from 'types/cli/release-data';
import { CommandModule } from 'yargs';
import { logger } from '../logger';

useBash();

const rootPath = path.resolve(__dirname, '..', '..', '..');

const RELEASE_DATA_FILE_NAME = '.release_data';

async function Command() {
  const alreadyExistsReleaseFile = await fszx.pathExists(
    path.resolve(rootPath, RELEASE_DATA_FILE_NAME)
  );

  if (!alreadyExistsReleaseFile) {
    logger.error("Release file doesn't exists. Please, create one before commiting");

    return process.exit(0);
  }

  const currentReleaseData = await (async () => {
    if (!alreadyExistsReleaseFile) return { updates: [] };

    return (await fszx.readJSON(path.resolve(rootPath, RELEASE_DATA_FILE_NAME), {
      throws: false,
      encoding: 'utf-8',
    })) as ReleaseData;
  })();

  if (currentReleaseData.updates.length === 0) {
    logger.error("Release file doesn't have any updates. Please, add one before commiting");

    return process.exit(0);
  }

  const releaseTitle = new Date().toISOString().split('T')[0];

  const releaseUpdates = currentReleaseData.updates
    .map((update) => `- ${update.hymn}: ${update.message}`)
    .join('\n');

  const releaseBody = `# Alterações de conteúdo\n${releaseUpdates}`;

  const hasGithubCli = await which('gh', { nothrow: true });

  console.log(logger);

  if (!hasGithubCli) {
    logger.info(
      "You don't have the github cli installed. Use this link to generate release in Github:"
    );

    const createReleaseURL = new URL(`https://github.com/coisasdoalto/hinarios-web/releases/new`);

    createReleaseURL.searchParams.set('title', releaseTitle);
    createReleaseURL.searchParams.set('body', releaseBody);
    createReleaseURL.searchParams.set('tag', releaseTitle);

    logger.blue(createReleaseURL.toString());

    return;
  }

  logger.info('Generating release in Github using gh...');

  await $`echo ${releaseBody} | gh release create ${releaseTitle} --title="${releaseTitle}" -F -`;

  logger.info('Release created successfully!');
  logger.info('Link to release:');
  logger.blue(`https://github.com/coisasdoalto/hinarios-web/releases/${releaseTitle}`);
}

export const CommitReleaseCommand: CommandModule = {
  command: 'commit-release',
  describe: 'Generate commit release',
  handler: () => Command(),
};
