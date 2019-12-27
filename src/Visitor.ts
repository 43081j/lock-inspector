import {
  PackageLock,
  PackageLockDependency,
  PackageLockError
} from './PackageLock';

export abstract class Visitor {
  public errors: Set<PackageLockError> = new Set();

  public abstract visit(root: PackageLock): Promise<void>;
  public abstract visitDependency(
    name: string,
    data: PackageLockDependency
  ): Promise<void>;

  protected async visitDependencies(
    deps: Record<string, PackageLockDependency>
  ): Promise<void> {
    const results: Promise<void>[] = [];

    for (const dep in deps) {
      results.push(this.visitDependency(dep, deps[dep]));
    }

    await Promise.all(results);
  }
}
