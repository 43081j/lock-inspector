import {PackageLockDependency} from '../PackageLock';

export interface VersionSet {
  name: string;
  versions: Map<string, string[]>;
}

const cachedResults = new WeakMap<
  Record<string, PackageLockDependency>,
  Map<string, VersionSet>
>();

/**
 * Compute a map of versions of packages and their URL(s)
 * @param deps Dependency tree to parse
 * @param root Optional version map to populate
 * @returns Populated version map
 */
export function computeVersions(
  deps: Record<string, PackageLockDependency>,
  root: Map<string, VersionSet> = new Map()
): Map<string, VersionSet> {
  const cached = cachedResults.get(deps);
  if (cached) {
    return cached;
  }

  for (const depName in deps) {
    if (Object.prototype.hasOwnProperty.call(deps, depName)) {
      const dep = deps[depName];

      if (dep.resolved) {
        const versionSet = root.get(depName) ?? {
          name: depName,
          versions: new Map()
        };

        root.set(depName, versionSet);

        const version = versionSet.versions.get(dep.version) ?? new Set();
        versionSet.versions.set(dep.version, version);

        version.add(dep.resolved);
      }

      if (dep.dependencies) {
        computeVersions(dep.dependencies, root);
      }
    }
  }

  cachedResults.set(deps, root);

  return root;
}
