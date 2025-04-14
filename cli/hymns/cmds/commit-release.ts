import path from 'node:path';

import { CommandModule } from 'yargs';
import { $, ProcessOutput, chalk, fs as fszx, question, useBash, which } from 'zx';

import { ReleaseData } from 'types/cli/ReleaseData';
import { RELEASE_DATA_FILE_NAME, ROOT_PATH } from '../constants';
import { logger } from '../logger';

useBash();

const releaseFilePath = path.resolve(ROOT_PATH, RELEASE_DATA_FILE_NAME);

async function clearReleaseFile() {
  const releaseFileData: ReleaseData = {
    updates: [],
  }

  await fszx.writeFile(releaseFilePath, JSON.stringify(releaseFileData, null, 2));
}

async function Command() {
  const existsReleaseFile = await fszx.pathExists(path.resolve(ROOT_PATH, RELEASE_DATA_FILE_NAME));

  if (!existsReleaseFile) {
    logger.error("Release file doesn't exists. Please, create one before commiting using", chalk.blue('`hymns update`'));

    return process.exit(0);
  }

  const releaseData: ReleaseData = await (async () => {
    if (!existsReleaseFile) return { updates: [] };

    return (await fszx.readJSON(releaseFilePath, {
      encoding: 'utf-8',
    })) as ReleaseData;
  })();

  if (releaseData.updates.length === 0) {
    logger.error("Release file doesn't have any updates. Please, add one before commiting using", chalk.blue('`hymns update`'));

    return process.exit(0);
  }

  // Example: 2023-10-01-12-00
  const releaseTitle = (await $`date +%Y-%m-%d-%H-%M`.quiet()).text().trim();

  const releaseUpdates = releaseData.updates
    .map((update) => `- ${update.hymn}: ${update.message}`)
    .join('\n');

  const releaseBody = `# Ajustes de conteúdo\n${releaseUpdates}`;

  logger.info('Release title:', releaseTitle);
  logger.info('Release body:');
  console.log(releaseBody, '\n');

  const confirmation = await question(
    `Are you sure you want to commit release ${chalk.blue(releaseTitle)}? (y/n) `
  );

  if (confirmation !== 'y') {
    logger.info('Aborting...');

    return;
  }

  const hasGithubCli = await which('gh', { nothrow: true });

  if (hasGithubCli) {
    logger.info('Generating release in Github using gh...');

    try {
      const releaseLink = (
        await $`echo ${releaseBody} | gh release create ${releaseTitle} --title="${releaseTitle}" -F -`.quiet()
      ).text();
      logger.info('Release created successfully!');
      logger.info('Link to release:');
      logger.blue(releaseLink);
    } catch (err) {
      const error = err as ProcessOutput;

      logger.error('Error while generating release in Github:', '\n');
      logger.red(error.stderr);
    }

    logger.info('Cleaning release file...');
    await clearReleaseFile();
    logger.info('Release file cleaned successfully!');

    return
  }

  logger.info(
    "You don't have the Github CLI installed. Use this link to generate release in Github:"
  );

  const createReleaseURL = new URL(`https://github.com/coisasdoalto/hinarios-web/releases/new`);

  createReleaseURL.searchParams.set('title', releaseTitle);
  createReleaseURL.searchParams.set('body', releaseBody);
  createReleaseURL.searchParams.set('tag', releaseTitle);

  logger.blue(createReleaseURL.toString());

  logger.info('Cleaning release file...');
  await clearReleaseFile();
  logger.info('Release file cleaned successfully!');
}

export const CommitReleaseCommand: CommandModule = {
  command: 'commit-release',
  describe: 'Generate commit release',
  handler: () => Command(),
};
