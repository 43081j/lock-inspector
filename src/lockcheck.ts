import * as fs from 'fs';
import * as path from 'path';
import {PackageLock, PackageLockError} from './PackageLock';
import * as program from 'commander';
import {InsecureUriVisitor} from './visitors/InsecureUriVisitor';

program
  .description(
    `Analyzes package-lock.json files for potential problems
    and differences if git is available`
  )
  .option('-d, --dir <path>', 'Path to directory containing lock file.', '.')
  .parse(process.argv);

const processFile = async (data: PackageLock): Promise<void> => {
  const visitors = [new InsecureUriVisitor()];
  const errors = new Set<PackageLockError>();

  for (const visitor of visitors) {
    await visitor.visit(data);
    if (visitor.errors.size > 0) {
      for (const err of visitor.errors) {
        errors.add(err);
      }
    }
  }

  if (errors.size > 0) {
    throw errors;
  }

  return;
};

if (program.dir) {
  const directoryPath = program.dir as string;
  const lockFilePath = `${directoryPath}${path.sep}package-lock.json`;
  let lockData: PackageLock;

  try {
    const lockFile = fs.readFileSync(lockFilePath, {encoding: 'utf-8'});
    try {
      lockData = JSON.parse(lockFile) as PackageLock;
    } catch (err) {
      console.log(`Error: Could not parse lock file "${lockFilePath}"`);
      process.exit(1);
    }
  } catch (err) {
    console.log(`Error: Could not read lock file "${lockFilePath}"`);
    process.exit(1);
  }

  processFile(lockData)
    .then(() => {
      console.log('Lock file passed checks.');
    })
    .catch((errors) => {
      for (const err of errors) {
        console.log(err);
      }
      process.exit(1);
    });
}
