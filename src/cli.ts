#!/usr/bin/env node
import * as program from 'commander';
import {lockcheck} from './lockcheck';

program
  .description(
    `Analyzes package-lock.json files for potential problems
    and differences if git is available`
  )
  .option('-d, --dir <path>', 'Path to directory containing lock file.', '.')
  .parse(process.argv);

if (program.dir) {
  lockcheck({
    path: program.dir as string
  })
    .then(() => {
      console.log('Lock file passed checks.');
    })
    .catch((err) => {
      if (err.messages) {
        for (const msg of err.messages) {
          console.log(msg);
        }
      } else {
        console.log(err.message);
      }

      process.exit(1);
    });
}
