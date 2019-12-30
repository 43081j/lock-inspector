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
        this._log.log('+', chalk.keyword('green')(name));
        this._log.empty();
      } else {
        const removedVersions = new Set(previousPkg.versions.keys());
        const addedVersions = new Set<string>();
        const changedVersions = new Map<string, Array<unknown[]>>();

        for (const [v, urls] of pkg.versions) {
          removedVersions.delete(v);

          const oldVersion = previousPkg.versions.get(v);

          if (!oldVersion) {
            addedVersions.add(v);
          } else {
            const newUrls = [...urls].filter((u) => !oldVersion.has(u));
            const oldUrls = [...oldVersion].filter((u) => !urls.has(u));

            const changedVersion = changedVersions.get(v) ?? [];

            for (const url of newUrls) {
              changedVersion.push(['+', chalk.keyword('green')(url)]);
            }

            for (const url of oldUrls) {
              changedVersion.push(['-', chalk.keyword('red')(url)]);
            }

            if (changedVersion.length > 0) {
              changedVersions.set(v, changedVersion);
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
            for (const [v, messages] of changedVersions.entries()) {
              this._log.log(chalk.keyword('orange')(`@${v}`));
              for (const message of messages) {
                this._log.log(...message);
              }
            }
          }

          this._log.empty();
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
