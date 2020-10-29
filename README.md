## lock-inspector

A tiny utility to analyze package-lock.json files for potential problems,
inconsistencies and security issues.

### Why?

The `package-lock.json` file is used to recreate the exact filesystem
structure for a project rather than depending on the loosely defined
versions in `package.json`.

Due to this, it is quite possible that someone could introduce lock file
changes which are either problematic or even malicious while leaving the
`package.json` file untouched.

Also, it is often an overlooked file in code reviews due to its size and
verbosity.

The combination of these two potential problems can lead to a seemingly
good looking pull request being merged which actually introduces problems
(malicious or not).

### Install

```
$ npm i -D lock-inspector
```

### Use

```
$ npx lock-inspector
```

### Options

```
  -d, --dir <path>         Path to directory containing lock file. (default: ".")
  --git-compare [commit]   Output the differences between the current lock file
                           and a specific git commit.
  -v, --verbose            Verbose output
  -h, --help               output usage information
```

### Rules

Lock files will be analysed for the following:

**Insecure URIs** - Any `http` URIs are considered unsafe and should be replaced
with secure equivalents.

**Duplicate versions** - Multiple occurrences of a single package with different
URLs is a sign of a possibly misconfigured lock file.

**Manifest inconsistencies** - Packages which exist in the lock file but
do not match/satisfy the corresponding entry in `package.json` are likely
misconfigured.

**Registry inconsistencies** - Unscoped packages in a lock file should all
have the same registry. It is valid, however, to have scoped packages
use a separate registry.

### Git comparison mode

You can compare to a previous version of your lock file using git compare mode:

```
$ npx lock-inspector --git-compare master
```

This will attempt to use git in order to compare the lock
file on disk and the original lock file in git (assuming
there is a difference).

### License

MIT
