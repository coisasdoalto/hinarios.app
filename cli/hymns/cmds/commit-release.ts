import path from 'node:path';

import { CommandModule } from 'yargs';
import { $, ProcessOutput, chalk, fs as fszx, question, useBash, which } from 'zx';

import { ReleaseData } from 'types/cli/ReleaseData';
import { logger } from '../logger';

useBash();

const rootPath = path.resolve(__dirname, '..', '..', '..');

const RELEASE_DATA_FILE_NAME = '.release_data';

async function Command() {
  const existsReleaseFile = await fszx.pathExists(path.resolve(rootPath, RELEASE_DATA_FILE_NAME));

  if (!existsReleaseFile) {
    logger.error("Release file doesn't exists. Please, create one before commiting");

    return process.exit(0);
  }

  const releaseData = await (async () => {
    if (!existsReleaseFile) return { updates: [] };

    return (await fszx.readJSON(path.resolve(rootPath, RELEASE_DATA_FILE_NAME), {
      encoding: 'utf-8',
    })) as ReleaseData;
  })();

  if (releaseData.updates.length === 0) {
    logger.error("Release file doesn't have any updates. Please, add one before commiting");

    return process.exit(0);
  }

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

    return;
  }

  logger.info(
    "You don't have the Github CLI installed. Use this link to generate release in Github:"
  );

  const createReleaseURL = new URL(`https://github.com/coisasdoalto/hinarios-web/releases/new`);

  createReleaseURL.searchParams.set('title', releaseTitle);
  createReleaseURL.searchParams.set('body', releaseBody);
  createReleaseURL.searchParams.set('tag', releaseTitle);

  logger.blue(createReleaseURL.toString());
}

export const CommitReleaseCommand: CommandModule = {
  command: 'commit-release',
  describe: 'Generate commit release',
  handler: () => Command(),
};
