import * as fs from 'fs';
import * as path from 'path';
import {PackageLock} from './PackageLock';
import {VisitorOptions} from './Visitor';
import {InsecureUriVisitor} from './visitors/InsecureUriVisitor';
import {GitDiffVisitor} from './visitors/GitDiffVisitor';
import {DuplicateVersionsVisitor} from './visitors/DuplicateVersionsVisitor';
import {
  ManifestInconsistencyVisitor
} from './visitors/ManifestInconsistencyVisitor';

export type Options = VisitorOptions;

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

  const visitors = opts.diffMode
    ? [new GitDiffVisitor(opts)]
    : [
        new InsecureUriVisitor(opts),
        new ManifestInconsistencyVisitor(opts),
        new DuplicateVersionsVisitor(opts)
      ];

  for (const visitor of visitors) {
    await visitor.visit(lockData);
  }

  if (visitors.some((v) => v.hasErrors())) {
    throw new Error('Package lock file failed validation.');
  }
}
