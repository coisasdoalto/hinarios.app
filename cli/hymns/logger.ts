import { ZodError } from 'zod';
import { chalk } from 'zx';

export const logger = {
  info: (...args: unknown[]) => console.log(chalk.blue('info:'), ...args),
  error: (...args: unknown[]) => console.error(chalk.red('error:'), ...args),
  blue: (...args: unknown[]) => console.log(chalk.blue(...args)),
  red: (...args: unknown[]) => console.log(chalk.red(...args)),
  zodError: (error: ZodError) =>
    error.issues.forEach((issue) => {
      // prettier-ignore
      console.log(
        "-",
        chalk.red(`${issue.path.join('.')}:`),
        issue.message
      );
    }),
};
