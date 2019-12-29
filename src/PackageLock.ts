export interface PackageLockDependency {
  version: string;
  resolved: string;
  integrity: string;
  dev: boolean;
  requires?: Record<string, string>;
  dependencies?: Record<string, PackageLockDependency>;
}

export interface PackageLock {
  name: string;
  version: string;
  lockfileVersion: number;
  requires: boolean;
  dependencies?: Record<string, PackageLockDependency>;
}
