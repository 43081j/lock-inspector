import * as fs from 'fs';
import * as path from 'path';
import {PackageLock, PackageLockError} from './PackageLock';
import {VisitorOptions} from './Visitor';
import {InsecureUriVisitor} from './visitors/InsecureUriVisitor';
import {
  ManifestInconsistencyVisitor
} from './visitors/ManifestInconsistencyVisitor';

type Options = VisitorOptions;

/**
 * Analyzes the lock-file of a given directory
 * @param opts Options to create analyzer with
 * @param opts.path Path of directory to analyze
 */
export async function lockcheck(opts: Options): Promise<void> {
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
    const err = new Error();
    (err as Error & {messages: Set<PackageLockError>}).messages = errors;
    throw err;
  }
}
