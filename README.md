## Fayde Unify

This tool unifies bower, requirejs, and typescript declarations.

Running `unify update` will update client configuration files.  Dependencies are gathered from `bower.json` and configured using `unify.json`.

Libraries without `unify.json` can still be used, but rely on default configuration.

## Usage

## Initializing

Running the following command will initialize a `unify.json` file.

```
$ unify init
```

## Bower integration

Bower can be configured to update whenever dependencies are installed/uninstalled.

You can run `unify bower` to automatically configure your `.bowerrc` similar to below.  This command can be run with the `--local` option to utilize a local `fayde-unify` npm module.

```
# .bowerrc

{
    "scripts": {
        "postinstall": "unify update" //If --local is specified: "(npm bin)/unify update"
    }
}

```

## Updating

If you would like to update [`fayde.json`](https://github.com/bsick7/fayde/wiki/Fayde.json) files, execute `unify update` from the same directory as `unify.json`.

## Excluding

You can configure unify to ignore library or library dependencies.

```
$ unify exclude --self
$ unify exclude --deps
$ unify exclude --self --deps
```
