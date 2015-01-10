## Fayde Unify

This tool unifies bower, requirejs, and typescript declarations.

Running `unify` will update client configuration files.  Dependencies are gathered from `bower.json` and configured using `unify.json`.

Libraries without `unify.json` can still be used, but rely on default configuration.

## Usage

## Initializing

Running the following command will initialize a `unify.json` file.

```
$ unify init
```

## Bower integration

Bower can be configured to update whenever dependencies are installed/uninstalled.

You can run `unify bower` to automatically configure your `.bowerrc` similar to below.

```
# .bowerrc

{
    "scripts": {
        "postinstall": "unify update",
        "preinstall": "unify update -un %"
    }
}

```

## Updating

If you would like to manually update [`fayde.json`](https://github.com/bsick7/fayde/wiki/Fayde.json) files, execute `unify update` from the same directory as `unify.json`.

## Excluding

You can configure unify to ignore library or library dependencies.

```
$ unify exclude --self
$ unify exclude --deps
$ unify exclude --self --deps
```