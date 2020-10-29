import {Visitor} from '../Visitor';
import {PackageLock, PackageLockDependency} from '../PackageLock';
import {computeVersions} from '../util/Versions';

/**
 * Detects inconsistent registries (i.e. more than one)
 */
export class RegistryInconsistencyVisitor extends Visitor {
  /** @inheritdoc */
  public async visit(data: PackageLock): Promise<void> {
    const dataVersions = data.dependencies
      ? computeVersions(data.dependencies)
      : new Map();

    const registries = new Set<string>();

    for (const [name, pkg] of dataVersions.entries()) {
      if (!name.startsWith('@')) {
        for (const urls of pkg.versions.values()) {
          for (const urlString of urls) {
            const url = new URL(urlString);
            registries.add(`${url.protocol}//${url.host}`);
          }
        }
      }
    }

    if (this.options.verbose) {
      this._log.log('Registries used:');
      for (const registry of registries) {
        this._log.log('-', registry);
      }
    }

    if (registries.size !== 1) {
      this._log.warn(
        `Multiple registries referenced for unscoped dependencies:`
      );
      for (const registry of registries) {
        this._log.log('-', registry);
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
