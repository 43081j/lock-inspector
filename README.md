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
  --diff            Enable diff mode
  -v, --verbose     Verbose output
  -h, --help        output usage information
```

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

### License

MIT
