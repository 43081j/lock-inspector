import {Visitor} from '../Visitor';
import {PackageLock, PackageLockDependency} from '../PackageLock';
import * as util from 'util';
import {exec} from 'child_process';
import {computeVersions, VersionSet} from '../util/Versions';
import * as chalk from 'chalk';

const execCommand = util.promisify(exec);

/**
 * Outputs a diff of underlying dependency changes
 */
export class GitDiffVisitor extends Visitor {
  /** @inheritdoc */
  public async visit(data: PackageLock): Promise<void> {
    let previousData: PackageLock;

    try {
      let diffSource = this.options.diffSource;

      if (!diffSource) {
        const {stdout} = await execCommand('git show :package-lock.json', {
          cwd: this.options.path
        });
        diffSource = stdout;
      }

      previousData = JSON.parse(diffSource);
    } catch (err) {
      // Eat up the errors for now as we just couldn't get hold of git
      return;
    }

    const currentVersions = data.dependencies
      ? computeVersions(data.dependencies)
      : new Map<string, VersionSet>();
    const previousVersions = previousData.dependencies
      ? computeVersions(previousData.dependencies)
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
