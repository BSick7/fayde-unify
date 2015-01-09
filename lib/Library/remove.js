var Promise = require('bluebird'),
    asyncpromise = require('../asyncpromise'),
    logger = require('../logger')(),
    getMeta = require('./meta');

function remove(sourceLib, lib) {
    var clients = sourceLib.clients;

    function load() {
        if (!lib.unify.exists)
            return Promise.resolve(lib);
        return lib.unify.load();
    }

    function removeLib(meta) {
        var exists = clients.anyHave('libs/' + meta.name) || clients.anyHave('themes/' + meta.name);

        clients
            .remove('libs/' + meta.name)
            .remove('themes/' + meta.name);

        if (exists)
            logger.debug('Removed record for ' + meta.name);
    }

    logger.indent();
    return load()
        .then(getMeta(sourceLib, lib))
        .tap(removeLib)
        .tap(function (meta) {
            var deps = sourceLib.dependencies.unshared(lib, meta.name)
                .map(function (dep) {
                    return sourceLib.createDependent(dep);
                });
            remove.many(sourceLib, deps);
        })
        .tap(function () {
            logger.unindent();
        })
}
remove.many = function (sourceLib, libs) {
    return asyncpromise.series((libs || []).map(function (lib) {
        return function () {
            return sourceLib.uninstall(lib);
        };
    }));
};

module.exports = remove;