var getMeta = require('./meta'),
    dependencies = require('./dependencies'),
    Promise = require('bluebird');

function uninstall(sourceLib, lib) {
    var renderer = sourceLib.renderer;
    var client = sourceLib.client;

    function load() {
        if (!lib.unify.exists)
            return Promise.resolve(lib);
        return lib.unify.load();
    }

    function removeLib(meta) {
        client
            .remove('libs/' + meta.name)
            .remove('themes/' + meta.name);

        renderer.debug('Uninstalled library from fayde.json. [' + meta.name + ']');
    }

    function uninstallDeps(meta) {
        return dependencies.getUnshared(sourceLib, lib, meta)
            .then(function (deps) {
                return Promise.all(deps.map(uninstallDep));
            });
    }

    function uninstallDep(dep) {
        return uninstall(sourceLib, dep);
    }

    return load()
        .then(getMeta(sourceLib, lib))
        .tap(removeLib)
        .tap(uninstallDeps);
}

module.exports = uninstall;