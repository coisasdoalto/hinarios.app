import yargs from 'yargs';
import { ZodError } from 'zod';

import { logger } from './logger';

type YargsFailHandlerArgs = Parameters<yargs.Argv<{}>['fail']>[0];

export function yargsErrorHandler(...args: Parameters<YargsFailHandlerArgs>) {
  const [msg, err, yargs] = args;

  if (err instanceof ZodError) {
    const [command] = process.argv.slice(2);

    logger.error(err.issues.map((issue) => issue.message).join('\n'), '\n');

    console.log(yargs.help(command));

    return process.exit(0);
  }

  if (err) throw err;

  logger.error(msg, '\n');
  console.log(yargs.help());

  return process.exit(1);
}
