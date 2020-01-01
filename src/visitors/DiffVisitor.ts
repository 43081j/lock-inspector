import {Visitor, VisitorOptions} from '../Visitor';
import {PackageLock, PackageLockDependency} from '../PackageLock';
import {computeVersions, VersionSet} from '../util/Versions';
import * as chalk from 'chalk';

/**
 * Outputs a diff of underlying dependency changes
 */
export class DiffVisitor extends Visitor {
  protected _sourceData: PackageLock;

  /**
   * @param opts Visitor options
   * @param sourceData Source to diff against
   */
  public constructor(opts: VisitorOptions, sourceData: PackageLock) {
    super(opts);
    this._sourceData = sourceData;
  }

  /** @inheritdoc */
  public async visit(data: PackageLock): Promise<void> {
    const currentVersions = data.dependencies
      ? computeVersions(data.dependencies)
      : new Map<string, VersionSet>();
    const previousVersions = this._sourceData.dependencies
      ? computeVersions(this._sourceData.dependencies)
      : new Map<string, VersionSet>();

    for (const pkg of previousVersions.keys()) {
      if (!currentVersions.has(pkg)) {
        this._log.log('-', chalk.keyword('red')(pkg));
      }
    }

    for (const [name, pkg] of currentVersions.entries()) {
      const previousPkg = previousVersions.get(name);

      if (!previousPkg) {
        this._log.log(name);
        for (const v of pkg.versions.keys()) {
          this._log.log('+', chalk.keyword('green')(v));
        }
      } else {
        const removedVersions = new Set(previousPkg.versions.keys());
        const addedVersions = new Set<string>();
        const changedVersions = new Set<unknown[]>();

        for (const [v, urls] of pkg.versions) {
          removedVersions.delete(v);

          const oldVersion = previousPkg.versions.get(v);

          if (!oldVersion) {
            addedVersions.add(v);
          } else {
            const newUrls = [...urls].filter((u) => !oldVersion.has(u));
            const oldUrls = [...oldVersion].filter((u) => !urls.has(u));

            for (const url of oldUrls) {
              changedVersions.add([
                '-',
                chalk.dim.keyword('yellow')(v),
                chalk.keyword('red')(`[${url}]`)
              ]);
            }

            for (const url of newUrls) {
              changedVersions.add([
                '+',
                chalk.dim.keyword('yellow')(v),
                chalk.keyword('green')(`[${url}]`)
              ]);
            }
          }
        }

        if (
          removedVersions.size > 0 ||
          addedVersions.size > 0 ||
          changedVersions.size > 0
        ) {
          this._log.log(name);

          for (const v of removedVersions) {
            this._log.log('-', chalk.keyword('red')(v));
          }

          for (const v of addedVersions) {
            this._log.log('+', chalk.keyword('green')(v));
          }

          if (changedVersions.size > 0) {
            for (const messages of changedVersions) {
              this._log.log(...messages);
            }
          }
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
