import {Visitor} from '../Visitor';
import {PackageLock, PackageLockDependency} from '../PackageLock';

/**
 * Detects insecure URLs in dependencies (i.e. non-https)
 */
export class InsecureUriVisitor extends Visitor {
  /** @inheritdoc */
  public async visit(data: PackageLock): Promise<void> {
    if (data.dependencies) {
      await this._visitDependencies(data.dependencies);
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
