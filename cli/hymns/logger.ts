import { chalk } from 'zx';

export const logger = {
  info: (...args: unknown[]) => console.log(chalk.blue('info:'), ...args),
  error: (...args: unknown[]) => console.error(chalk.red('error:'), ...args),
  blue: (...args: unknown[]) => console.log(chalk.blue(...args)),
  red: (...args: unknown[]) => console.log(chalk.red(...args)),
};
