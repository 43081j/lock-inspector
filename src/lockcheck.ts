import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import {exec} from 'child_process';
import {PackageLock} from './PackageLock';
import {Visitor, VisitorOptions} from './Visitor';
import {InsecureUriVisitor} from './visitors/InsecureUriVisitor';
import {DiffVisitor} from './visitors/DiffVisitor';
import {DuplicateVersionsVisitor} from './visitors/DuplicateVersionsVisitor';
import {
  ManifestInconsistencyVisitor
} from './visitors/ManifestInconsistencyVisitor';
import {
  RegistryInconsistencyVisitor
} from './visitors/RegistryInconsistencyVisitor';

const execCommand = util.promisify(exec);

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

  const visitors: Visitor[] = [];

  if (opts.diffMode) {
    let diffSource: PackageLock;

    if (opts.diffSource) {
      diffSource = JSON.parse(opts.diffSource);
    } else {
      const diffCommit = opts.diffCommit ?? '';
      if (!diffCommit.match(/^[\w^]*$/)) {
        throw new Error('Specified commit was of an invalid format.');
      }

      try {
        const {stdout} = await execCommand(`git show ${diffCommit}:package-lock.json`, {
          cwd: opts.path
        });

        diffSource = JSON.parse(stdout);
      } catch (err) {
        throw new Error('Specified commit could not be retrieved.');
      }
    }

    visitors.push(new DiffVisitor(opts, diffSource));
  } else {
    visitors.push(...[
      new InsecureUriVisitor(opts),
      new ManifestInconsistencyVisitor(opts),
      new DuplicateVersionsVisitor(opts),
      new RegistryInconsistencyVisitor(opts)
    ]);
  }

  for (const visitor of visitors) {
    await visitor.visit(lockData);
  }

  if (visitors.some((v) => v.hasErrors())) {
    throw new Error('Package lock file failed validation.');
  }
}
