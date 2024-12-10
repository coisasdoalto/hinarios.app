import { CommandModule } from 'yargs';

import { CommitReleaseCommand } from './commit-release';
import { UpdateHymnsCommand } from './update';

export const commands: CommandModule[] = [UpdateHymnsCommand, CommitReleaseCommand];
