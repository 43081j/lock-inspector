export interface PackageManifest {
  name: string;
  version: string;
  description: string;
  main: string;
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
}
