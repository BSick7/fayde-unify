var Promise = require('bluebird'),
    logger = require('../logger')(),
    getMeta = require('./meta');

function uninstall(sourceLib, lib) {
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

        logger.debug('Uninstalled library from fayde.json. [' + meta.name + ']');
    }

    function uninstallDeps(meta) {
        var deps = sourceLib.unshared(lib, meta.name);
        return Promise.all(deps.map(uninstallDep));
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