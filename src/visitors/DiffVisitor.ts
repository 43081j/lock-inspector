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
        for (const [v, urls] of pkg.versions.entries()) {
          for (const url of urls) {
            this._log.log(
              '+',
              chalk.keyword('green')(v),
              chalk.dim.keyword('green')(`[${url}]`)
            );
          }
        }
      } else {
        const messages = new Set<string[]>();

        for (const v of previousPkg.versions.keys()) {
          if (!pkg.versions.has(v)) {
            messages.add([
              '-',
              chalk.keyword('red')(v)
            ]);
          }
        }

        for (const [v, urls] of pkg.versions) {
          const oldVersion = previousPkg.versions.get(v);

          if (!oldVersion) {
            for (const url of urls) {
              messages.add([
                '+',
                chalk.keyword('green')(v),
                chalk.dim.keyword('green')(`[${url}]`)
              ]);
            }
          } else {
            const newUrls = [...urls].filter((u) => !oldVersion.has(u));
            const oldUrls = [...oldVersion].filter((u) => !urls.has(u));

            for (const url of oldUrls) {
              messages.add([
                '-',
                chalk.dim.keyword('yellow')(v),
                chalk.keyword('red')(`[${url}]`)
              ]);
            }

            for (const url of newUrls) {
              messages.add([
                '+',
                chalk.dim.keyword('yellow')(v),
                chalk.keyword('green')(`[${url}]`)
              ]);
            }
          }
        }

        if (messages.size > 0) {
          this._log.log(name);

          for (const message of messages) {
            this._log.log(...message);
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
