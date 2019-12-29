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
    let headData: PackageLock;

    try {
      let diffSource = this.options.diffSource;

      if (!diffSource) {
        const {stdout} = await execCommand('git show :package-lock.json', {
          cwd: this.options.path
        });
        diffSource = stdout;
      }

      headData = JSON.parse(diffSource);
    } catch (err) {
      // Eat up the errors for now as we just couldn't get hold of git
      return;
    }

    const dataVersions = data.dependencies
      ? computeVersions(data.dependencies)
      : new Map<string, VersionSet>();
    const headVersions = headData.dependencies
      ? computeVersions(headData.dependencies)
      : new Map<string, VersionSet>();

    const newPackages = [...dataVersions.keys()].filter(
      (k) => !headVersions.has(k)
    );
    const removedPackages = [...headVersions.keys()].filter(
      (k) => !dataVersions.has(k)
    );

    if (newPackages.length > 0) {
      this._log.info('New Packages:', newPackages);
    }

    if (removedPackages.length > 0) {
      this._log.info('Removed Packages:', removedPackages);
    }

    for (const [name, pkg] of dataVersions.entries()) {
      const headPkg = headVersions.get(name);
      if (headPkg) {
        const newVersions = [...pkg.versions.keys()]
          .filter((k) => !headPkg.versions.has(k));
        const removedVersions = [...headPkg.versions.keys()]
          .filter((k) => !pkg.versions.has(k));
        const changedVersions = [...pkg.versions.entries()]
          .filter(([k, v]) => {
            const headVal = headPkg.versions.get(k);
            return headVal !== undefined &&
              (v.size !== headVal.size ||
                ![...v].every((num) => headVal.has(num)));
          });

        if (newVersions.length > 0 ||
          changedVersions.length > 0 ||
          removedVersions.length > 0) {
          this._log.info(`Package "${name}" changed:`);

          if (newVersions.length > 0) {
            for (const v of newVersions) {
              this._log.log(
                '-',
                chalk.keyword('green')(v)
              );
            }
          }

          if (removedVersions.length > 0) {
            for (const v of removedVersions) {
              this._log.log(
                '-',
                chalk.keyword('red')(v)
              );
            }
          }

          if (changedVersions.length > 0) {
            for (const [v, urls] of changedVersions) {
              const oldVersion = headPkg.versions.get(v);

              if (!oldVersion) {
                continue;
              }

              this._log.log(
                '-',
                chalk.keyword('orange')('[URL CHANGE]'),
                v
              );

              for (const url of urls) {
                if (!oldVersion.has(url)) {
                  this._log.log(
                    ' ',
                    chalk.keyword('green')(url)
                  );
                }
              }

              for (const url of oldVersion) {
                if (!urls.has(url)) {
                  this._log.log(
                    ' ',
                    chalk.keyword('red')(url)
                  );
                }
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
