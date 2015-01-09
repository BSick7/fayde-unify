var path = require('path'),
    Promise = require('bluebird'),
    logger = require('../logger')(),
    getMeta = require('./meta'),
    dependencies = require('./dependencies'),
    remove = require('./remove');

function add(sourceLib, lib) {
    var clients = sourceLib.clients;

    function transcribe(meta) {
        if (meta.isSelfExcluded) {
            clients.remove('libs/' + meta.name)
                .remove('themes/' + meta.name);
            logger.debug('Excluded ' + lib.name);
            return;
        }

        var dist = meta.dist || undefined;
        if (dist && isDefaultLibPath(meta))
            dist = undefined;

        var exports = meta.exports || undefined;

        var themes = meta.themes || undefined;
        if (themes)
            themes = JSON.parse(JSON.stringify(themes));

        clients.setValue('libs/' + meta.name + '/exports', exports)
            .setPathValue('libs/' + meta.name + '/path', dist, meta.libName)
            .setValue('themes/' + meta.name, themes)
            .fallback('libs/' + meta.name, {})
            .fallback('themes/' + meta.name, {});

        logger.debug('Configured ' + lib.name);
    }

    function isDefaultLibPath(meta) {
        var expected = path.join('dist', meta.name);
        return (meta.dist === expected)
            || (meta.dist === expected + '.js');
    }

    function installDeps(meta) {
        var deps = sourceLib.dependencies.all(lib);
        if (deps.length < 1) {
            clients.remove('libs/' + meta.name + '/deps');
            return Promise.resolve([]);
        }
        if (meta.isDepsExcluded) {
            clients.remove('libs/' + meta.name + '/deps');
            logger.debug('Excluded dependencies for ' + meta.name);
            return remove.many(sourceLib, deps);
        }
        var depNames = getMetaDepNames(deps);
        if (depNames.length > 0)
            clients.setValue('libs/' + meta.name + '/deps', depNames);
        else
            clients.remove('libs/' + meta.name + '/deps');
        return add.many(sourceLib, deps);
    }

    function getMetaDepNames(deps) {
        var names = [];
        for (var i = 0; i < deps.length; i++) {
            var dep = deps[i];
            var curmeta = getMeta(sourceLib, dep)();
            if (curmeta.isSelfExcluded)
                continue;
            names.push(curmeta ? curmeta.name : dep.name);
        }
        return names;
    }

    logger.indent();
    if (!lib.unify.exists) {
        logger.warn('Library does not have a unify.json file. [' + lib.name + ']');
        clients
            .setValue('libs/' + lib.name, {})
            .setValue('themes/' + lib.name, "none");
        return installDeps({name: lib.name})
            .tap(function () {
                logger.unindent();
            });
    }

    return lib.unify.load()
        .then(getMeta(sourceLib, lib))
        .tap(transcribe)
        .tap(installDeps)
        .tap(function () {
            logger.unindent();
        })
}

add.all = function (sourceLib) {
    logger.indent();
    var depNames = sourceLib.dependencies.lib();
    return depNames.reduce(function (agg, cur) {
        return agg.then(function () {
            return sourceLib.install(cur);
        })
    }, Promise.resolve(sourceLib))
        .tap(function () {
            logger.unindent();
        });
};

add.many = function (sourceLib, libs) {
    (libs || []).reduce(function (agg, cur) {
        return agg.then(function () {
            return add(sourceLib, cur);
        });
    }, Promise.resolve(libs));
};

module.exports = add;