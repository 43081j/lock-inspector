import * as fs from 'fs';
import * as path from 'path';
import {PackageLock, PackageLockError} from './PackageLock';
import * as program from 'commander';
import {VisitorOptions} from './Visitor';
import {InsecureUriVisitor} from './visitors/InsecureUriVisitor';
import {
  ManifestInconsistencyVisitor
} from './visitors/ManifestInconsistencyVisitor';

program
  .description(
    `Analyzes package-lock.json files for potential problems
    and differences if git is available`
  )
  .option('-d, --dir <path>', 'Path to directory containing lock file.', '.')
  .parse(process.argv);

type Options = VisitorOptions;

const processFile = async (opts: Options): Promise<void> => {
  const lockFilePath = `${opts.path}${path.sep}package-lock.json`;
  let lockData: PackageLock;
  let lockFile: string;

  try {
    lockFile = fs.readFileSync(lockFilePath, {encoding: 'utf-8'});
  } catch (err) {
    throw new Error(`Error: Could not read lock file "${lockFilePath}"`);
  }

  try {
    lockData = JSON.parse(lockFile) as PackageLock;
  } catch (err) {
    throw new Error(`Error: Could not parse lock file "${lockFilePath}"`);
  }

  const visitors = [
    new InsecureUriVisitor(opts),
    new ManifestInconsistencyVisitor(opts)
  ];
  const errors = new Set<PackageLockError>();

  for (const visitor of visitors) {
    await visitor.visit(lockData);

    if (visitor.errors.size > 0) {
      for (const err of visitor.errors) {
        errors.add(err);
      }
    }
  }

  if (errors.size > 0) {
    throw {
      message: errors
    };
  }
};

if (program.dir) {
  processFile({
    path: program.dir as string
  })
    .then(() => {
      console.log('Lock file passed checks.');
    })
    .catch((err) => {
      if (Array.isArray(err.message)) {
        for (const msg of err.message) {
          console.log(msg);
        }
      } else {
        console.log(err.message);
      }

      process.exit(1);
    });
}
