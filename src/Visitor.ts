import {
  PackageLock,
  PackageLockDependency,
  PackageLockError
} from './PackageLock';

/**
 * Base implementation of a package-lock visitor.
 */
export abstract class Visitor {
  public errors: Set<PackageLockError> = new Set();

  /**
   * Visits a given package lock object
   * @param root Package lock data to analyze
   */
  public abstract visit(root: PackageLock): Promise<void>;

  /**
   * Visits a single dependency of a package
   * @param name Dependency name being analyzed
   * @param data Dependency being analyzed
   */
  public abstract visitDependency(
    name: string,
    data: PackageLockDependency
  ): Promise<void>;

  /**
   * Visits each dependency in a given set of dependencies
   * @param deps Dictionary-like collection of dependencies to analyze
   */
  protected async _visitDependencies(
    deps: Record<string, PackageLockDependency>
  ): Promise<void> {
    const results: Promise<void>[] = [];

    for (const dep in deps) {
      if (Object.prototype.hasOwnProperty.call(deps, dep)) {
        results.push(this.visitDependency(dep, deps[dep]));
      }
    }

    await Promise.all(results);
  }
}
