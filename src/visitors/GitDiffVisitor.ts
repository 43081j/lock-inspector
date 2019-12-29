import {Visitor} from '../Visitor';
import {PackageLock, PackageLockDependency} from '../PackageLock';
import * as util from 'util';
import {exec} from 'child_process';
import {computeVersions} from '../util/Versions';

const execCommand = util.promisify(exec);

/**
 * Outputs a diff of underlying dependency changes
 */
export class GitDiffVisitor extends Visitor {
  /** @inheritdoc */
  public async visit(data: PackageLock): Promise<void> {
    let headData: PackageLock;

    try {
      const {stdout} = await execCommand('git show :package-lock.json', {
        cwd: this.options.path
      });

      headData = JSON.parse(stdout);
    } catch (err) {
      // Eat up the errors for now as we just couldn't get hold of git
      return;
    }

    const dataVersions = data.dependencies
      ? computeVersions(data.dependencies)
      : new Map();
    const headVersions = headData.dependencies
      ? computeVersions(headData.dependencies)
      : new Map();

    const newPackages = [...dataVersions.keys()].filter(
      (k) => !headVersions.has(k)
    );
    const removedPackages = [...headVersions.keys()].filter(
      (k) => !dataVersions.has(k)
    );

    if (newPackages.length > 0) {
      this._log.info('New Packages:', newPackages);
    }

    if (removedPackages.length > 0) {
      this._log.info('Removed Packages:', removedPackages);
    }

    return Promise.resolve();
  }

  /** @inheritdoc */
  public async visitDependency(
    _name: string,
    _data: PackageLockDependency
  ): Promise<void> {
    return Promise.resolve();
  }
}
