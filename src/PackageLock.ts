export interface PackageLockDependency {
  version: string;
  resolved: string;
  integrity: string;
  dev: boolean;
  requires?: Record<string, string>;
  dependencies?: Record<string, PackageLockDependency>;
}

export interface PackageLockPackage {
  version: string;
  resolved: string;
  integrity: string;
  dev?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface PackageLockVersion1 {
  lockFileVersion: 1;
  name: string;
  version: string;
  lockfileVersion: number;
  requires: boolean;
  dependencies?: Record<string, PackageLockDependency>;
}

export interface PackageLockVersion2 {
  lockFileVersion: 2;
  name: string;
  version: string;
  requires: boolean;
  packages?: Record<string, PackageLockPackage>;
  dependencies?: Record<string, PackageLockDependency>;
}

export type PackageLock = PackageLockVersion1 | PackageLockVersion2;
