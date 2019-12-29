import {PackageLock, PackageLockDependency} from './PackageLock';
import {Logger} from './Logger';

export interface VisitorOptions {
  path: string;
  outputDiff?: boolean;
}

/**
 * Base implementation of a package-lock visitor.
 */
export abstract class Visitor {
  public options: VisitorOptions;

  protected _log: Logger = new Logger();

  /**
   * @param opts Options
   * @param opts.path Path of directory being analyzed
   */
  public constructor(opts: VisitorOptions) {
    this.options = opts;
  }

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
   * Determines whether this visitor has errored/warned or not
   * @returns whether visitor has errors or not
   */
  public hasErrors(): boolean {
    return this._log.errors > 0 || this._log.warnings > 0;
  }

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
