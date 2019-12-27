import {Visitor} from '../Visitor';
import {PackageLock, PackageLockDependency} from '../PackageLock';
import {PackageManifest} from '../PackageManifest';
import * as util from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as semver from 'semver';

const readFile = util.promisify(fs.readFile);

/**
 * Detects inconsistencies between package manifests and lock files
 */
export class ManifestInconsistencyVisitor extends Visitor {
  /** @inheritdoc */
  public async visit(data: PackageLock): Promise<void> {
    if (!data.dependencies) {
      return;
    }

    const manifestPath = `${this.options.path}${path.sep}/package.json`;
    let manifest: PackageManifest;

    try {
      const manifestContents = await readFile(manifestPath, {
        encoding: 'utf-8'
      });
      manifest = JSON.parse(manifestContents);
    } catch (err) {
      // early exit if no package manifest readable
      return;
    }

    const manifestDeps: Record<string, string> = {
      ...manifest.dependencies,
      ...manifest.devDependencies
    };

    for (const dep in data.dependencies) {
      if (Object.prototype.hasOwnProperty.call(data.dependencies, dep)) {
        const lockVersion = data.dependencies[dep].version;
        const manifestVersion = manifestDeps[dep];
        if (
          manifestVersion &&
          !semver.satisfies(lockVersion, manifestVersion)
        ) {
          this.errors.add({
            message: `Dependency "${dep}" version mismatch. ${lockVersion}
              from lock-file does not satisfy ${manifestVersion}.`
          });
        }
      }
    }
  }

  /** @inheritdoc */
  public async visitDependency(
    name: string,
    data: PackageLockDependency
  ): Promise<void> {
    if (data.dependencies) {
      await this._visitDependencies(data.dependencies);
    }

    if (data.resolved && data.resolved.startsWith('http://')) {
      this.errors.add({
        message: `Insecure URL for dependency "${name}": ${data.resolved}`
      });
    }
  }
}
