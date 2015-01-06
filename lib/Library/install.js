var Promise = require('bluebird'),
    getMeta = require('./meta'),
    dependencies = require('./dependencies');

function install(sourceLib, lib) {
    var renderer = sourceLib.renderer;
    var client = sourceLib.client;

    function transcribe(meta) {
        if (meta.isSelfExcluded) {
            client.remove('libs/' + meta.name)
                .remove('themes/' + meta.name);
            renderer.debug('Excluded library from fayde.json. [' + lib.name + ']');
            return;
        }

        client
            .setValue('libs/' + meta.name, {})
            .setValue('themes/' + meta.name, {});

        if (meta.exports)
            client.setValue('libs/' + meta.name + '/exports', meta.exports);

        if (meta.dist)
            client.setValue('libs/' + meta.name + '/path', meta.dist);

        renderer.debug('Installed library to fayde.json. [' + lib.name + ']');
    }

    function installDeps(meta) {
        return dependencies.getAll(sourceLib, lib)
            .tap(function (deps) {
                if (deps.length < 1)
                    return;
                if (meta.isDepsExcluded) {
                    renderer.debug('Excluded library dependencies from fayde.json. [' + meta.name + ']');
                    return;
                }
                var depNames = getMetaDepNames(deps);
                if (depNames.length > 0)
                    client.setValue('libs/' + meta.name + '/deps', depNames);
                else
                    client.remove('libs/' + meta.name + '/deps');
                return Promise.all(deps.map(installDep));
            });
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

    if (!lib.unify.exists) {
        renderer.warn('Library does not have a unify.json file. [' + lib.name + ']');
        client
            .setValue('libs/' + lib.name, {})
            .setValue('themes/' + lib.name, "none");
        return installDeps();
    }

    return lib.unify.load()
        .then(getMeta(sourceLib, lib))
        .tap(transcribe)
        .tap(installDeps);
}

module.exports = install;