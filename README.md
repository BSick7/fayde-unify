## Fayde Unify

This tool automates configuration of Fayde applications.

Unify relies on bower as its package manager.
When developing applications, instead of using `bower install`, use `unify install`.

Unify looks for `unify.json` in the resolved library.  If found, metadata is used to include the library in the Fayde application.

Unify administers [`fayde.json`](https://github.com/bsick7/fayde/wiki/Fayde.json) to properly set up client libraries.

## Usage

### Initializing

```
$ unify init
```

### Installing libraries

```
# install dependencies listed in bower.json and add to unify.json
$ unify install

# install a library and add to unify.json
$ unify install <package> --save

# install specific version of a package and add to unify.json
$ unify install <package>#<version> --save
```

### Updating libraries

```
# update dependencies listed in bower.json and update unify.json
$ unify update

# update library and update unify.json
$ unify update <package>
```

### Uninstalling libraries

```
$ unify uninstall <package-name>
```
