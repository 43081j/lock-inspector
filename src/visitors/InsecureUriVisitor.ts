import {Visitor} from '../Visitor';
import {PackageLock, PackageLockDependency} from '../PackageLock';

export class InsecureUriVisitor extends Visitor {
  public async visit(data: PackageLock): Promise<void> {
    if (data.dependencies) {
      await this.visitDependencies(data.dependencies);
    }
  }

  public async visitDependency(
    name: string,
    data: PackageLockDependency
  ): Promise<void> {
    if (data.dependencies) {
      await this.visitDependencies(data.dependencies);
    }

    if (data.resolved && data.resolved.startsWith('http://')) {
      this.errors.add({
        message: `Insecure URL for dependency "${name}": ${data.resolved}`
      });
    }
  }
}
