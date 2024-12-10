#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { commands } from './cmds/';
import { yargsErrorHandler } from './error-handler';

const cli = yargs(hideBin(process.argv))
  .scriptName('hymns')
  .strict()
  .demandCommand(1, 'You need at least one command')
  .recommendCommands()
  .strict()
  .locale('en')
  .fail(yargsErrorHandler);

for (const command of commands) {
  cli.command(command);
}

cli.parse();
