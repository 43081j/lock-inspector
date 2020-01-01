## lockcheck

A tiny utility to analyze package-lock.json files for potential problems,
inconsistencies and security issues.

### Install

```
$ npm i -D @43081j/lockcheck
```

### Use

```
$ npx lockcheck
```

### Options

```
  -d, --dir <path>  Path to directory containing lock file. (default: ".")
  --diff [commit]   Enable diff mode on the specified gitcommit (default is
                    against unchanged file in current branch)
  -v, --verbose     Verbose output
  -h, --help        output usage information
```

### Validators

`lockcheck` will analyze lock files for the following:

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

### Diff mode

You can diff two lock files like so:

```
$ npx lockcheck --diff
```

This will attempt to use git in order to compare the lock
file on disk and the original lock file in git (assuming
there is a difference).

Alternatively, you can pipe a lock file into lockcheck to
compare against:

```
$ git show :package-lock.json | npx lockcheck --diff
```

Or you can specify a commit-ish:

```
$ npx lockcheck --diff master
```

### License

MIT
