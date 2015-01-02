## Fayde Unify

This tool automates configuration of Fayde applications.

Unify relies on bower as its package manager.
When developing applications, instead of using `bower install`, use `fayde install`.

Unify looks for `unify.json` in the resolved library.  If found, metadata is used to include the library in the Fayde application.

Unify manages `fayde.json` as metadata to resolve libraries (and resources).

## Usage

### Initializing

```
$ fayde init
```

### Installing libraries

```
# install dependencies listed in unify.json
$ fayde install

# install a library and add it to unify.json
$ fayde install <package> --save

# install specific version of a package and add it to unify.json
$ fayde install <package>#<version> --save
```

### Uninstalling libraries

```
$ fayde uninstall <package-name>
```