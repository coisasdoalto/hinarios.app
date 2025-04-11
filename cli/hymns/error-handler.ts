import yargs from 'yargs';
import { ZodError } from 'zod';
import { chalk } from 'zx';

import { logger } from './logger';

type YargsFailHandlerArgs = Parameters<yargs.Argv<{}>['fail']>[0];

export function yargsErrorHandler(...args: Parameters<YargsFailHandlerArgs>) {
  const [errorMessage, error, yargs] = args;

  if (error instanceof ZodError) {
    const [command] = process.argv.slice(2);

    logger.error('Invalid arguments:');

    logger.zodError(error)

    logger.blue('\nSee help for more details:\n');

    console.log(yargs.help(command));

    return process.exit(0);
  }

  if (error) throw error;

  logger.error(errorMessage, '\n');
  console.log(yargs.help());

  return process.exit(1);
}
