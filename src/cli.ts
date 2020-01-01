#!/usr/bin/env node
import * as program from 'commander';
import {stdin} from 'process';
import {lockcheck, Options} from './lockcheck';

const inputResult = new Promise<string>((res) => {
  let result = '';

  if (stdin.isTTY) {
    res(result);
    return;
  }

  stdin.setEncoding('utf8');

  stdin.on('readable', () => {
    let chunk;

    while ((chunk = stdin.read()) !== null) {
      result += chunk;
    }
  });

  stdin.on('end', () => {
    res(result);
  });
});

program
  .description(
    `Analyzes package-lock.json files for potential problems
    and differences if git is available`
  )
  .option('-d, --dir <path>', 'Path to directory containing lock file.', '.')
  .option('--diff [commit]', 'Enable diff mode on the specified git' +
    'commit (default is against unchanged file in current branch)')
  .option('-v, --verbose', 'Verbose output')
  .parse(process.argv);

if (program.dir) {
  const opts: Options = {
    diffMode: program.diff !== undefined,
    path: program.dir as string,
    verbose: program.verbose === true
  };

  if (typeof program.diff === 'string') {
    opts.diffCommit = program.diff;
  }

  inputResult
    .then((input) => {
      if (input && input.trim() !== '') {
        opts.diffSource = input;
      }
      return lockcheck(opts);
    })
    .then(() => {
      if (!opts.diffMode) {
        console.log('Lock file passed checks.');
      }
    })
    .catch((err) => {
      console.log(err.message);
      process.exit(1);
    });
}
