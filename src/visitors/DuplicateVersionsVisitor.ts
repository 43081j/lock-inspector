import {Visitor} from '../Visitor';
import {PackageLock, PackageLockDependency} from '../PackageLock';
import {computeVersions} from '../util/Versions';

/**
 * Detects duplicate entries for an individual package version
 */
export class DuplicateVersionsVisitor extends Visitor {
  /** @inheritdoc */
  public async visit(data: PackageLock): Promise<void> {
    const dataVersions = data.dependencies
      ? computeVersions(data.dependencies)
      : new Map();

    for (const pkg of dataVersions.values()) {
      for (const [version, urls] of pkg.versions.entries()) {
        if (urls.size > 1) {
          this._log.warn(
            `"${pkg.name}" has multiple URLs for a version ${version}:`
          );
          for (const url of urls) {
            this._log.log('-', url);
          }
          this._log.empty();
        }
      }
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
