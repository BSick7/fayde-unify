var path = require('path'),
    Promise = require('bluebird'),
    logger = require('../logger')(),
    getMeta = require('./meta'),
    dependencies = require('./dependencies'),
    uninstall = require('./uninstall');

function install(sourceLib, lib) {
    var clients = sourceLib.clients;

    function transcribe(meta) {
        if (meta.isSelfExcluded) {
            clients.remove('libs/' + meta.name)
                .remove('themes/' + meta.name);
            logger.debug('Excluded library from fayde.json. [' + lib.name + ']');
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

        logger.debug('Installed library to fayde.json. [' + lib.name + ']');
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
            return;
        }
        if (meta.isDepsExcluded) {
            clients.remove('libs/' + meta.name + '/deps');
            logger.debug('Excluded library dependencies from fayde.json. [' + meta.name + ']');
            return Promise.all(deps.map(uninstallDep));
        }
        var depNames = getMetaDepNames(deps);
        if (depNames.length > 0)
            clients.setValue('libs/' + meta.name + '/deps', depNames);
        else
            clients.remove('libs/' + meta.name + '/deps');
        return Promise.all(deps.map(installDep));
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

    function installDep(dep) {
        return install(sourceLib, dep);
    }

    function uninstallDep(dep) {
        return uninstall(sourceLib, dep);
    }

    if (!lib.unify.exists) {
        logger.warn('Library does not have a unify.json file. [' + lib.name + ']');
        clients
            .setValue('libs/' + lib.name, {})
            .setValue('themes/' + lib.name, "none");
        return installDeps({name: lib.name});
    }

    return lib.unify.load()
        .then(getMeta(sourceLib, lib))
        .tap(transcribe)
        .tap(installDeps);
}

module.exports = install;