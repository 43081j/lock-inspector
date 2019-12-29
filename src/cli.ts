#!/usr/bin/env node
import * as program from 'commander';
import {lockcheck} from './lockcheck';

program
  .description(
    `Analyzes package-lock.json files for potential problems
    and differences if git is available`
  )
  .option('-d, --dir <path>', 'Path to directory containing lock file.', '.')
  .option('--diff', 'Enable diff mode.')
  .parse(process.argv);

if (program.dir) {
  const opts = {
    outputDiff: program.diff !== undefined,
    path: program.dir as string
  };

  lockcheck(opts)
    .then(() => {
      if (!opts.outputDiff) {
        console.log('Lock file passed checks.');
      }
    })
    .catch((err) => {
      console.log(err.message);
      process.exit(1);
    });
}
