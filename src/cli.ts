#!/usr/bin/env node
import * as program from 'commander';
import {inspector, Options} from './inspector';

program
  .description(
    `Analyzes package-lock.json files for potential problems
and differences if git is available`
  )
  .option('-d, --dir <path>', 'Path to directory containing lock file.', '.')
  .option('--git-compare [commit]', 'Enable diff mode on the specified git' +
    'commit')
  .option('-v, --verbose', 'Verbose output')
  .parse(process.argv);

if (program.dir) {
  const opts: Options = {
    gitCompare: program.gitCompare as string,
    path: program.dir as string,
    verbose: program.verbose === true
  };

  inspector(opts)
    .then(() => {
      console.log('lock-inspector: checks passed.');
    })
    .catch((err) => {
      console.log(err.message);
      process.exit(1);
    });
}
