import yargs from 'yargs';
import { ZodError } from 'zod';
import { chalk } from 'zx';

type YargsFailHandlerArgs = Parameters<yargs.Argv<{}>['fail']>[0];

export function yargsErrorHandler(...args: Parameters<YargsFailHandlerArgs>) {
  const [msg, err, yargs] = args;

  if (err instanceof ZodError) {
    console.error(chalk.red('error'), err.issues.map((issue) => issue.message).join('\n'), '\n');
    console.log(yargs.help());
    return process.exit(0);
  }

  if (err) throw err;

  console.error(chalk.red('error'), msg, '\n');
  console.log(yargs.help());

  return process.exit(1);
}
