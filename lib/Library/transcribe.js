var path = require('path'),
    logger = require('../logger')(),
    isString = require('../isString');

function transcribe(libs, clients) {
    function transcribeSingle(lib) {
        if (lib.unify.getValue('type') === 'app')
            return;

        var name = lib.unify.getValue('name') || lib.name;
        logger.info('Updated records for ' + name);

        var dist = lib.unify.getValue('dist') || undefined;
        if (!dist) {
            dist = lib.bower.file.getValue('main') || undefined;
            if (!isString(dist))
                dist = undefined;
        }
        if (dist && isDefaultLibPath(name, dist))
            dist = undefined;

        var exports = lib.unify.getValue('library/exports') || undefined;

        var themes = lib.unify.getValue('themes') || undefined;
        if (themes) {
            themes = JSON.parse(JSON.stringify(themes));
        }

        var deps = (lib.bowerDeps || [])
            .filter(isDependencyIncluded)
            .map(function (dep) {
                return dep.unify.getValue('name') || dep.name;
            });
        if (deps.length <= 0)
            deps = undefined;

        clients
            .setValue('libs/' + name + '/exports', exports)
            .setPathValue('libs/' + name + '/base', '', lib.name)
            .setPathValue('libs/' + name + '/path', dist, lib.name)
            .setValue('libs/' + name + '/deps', deps, function (value, file, test) {
                if (!value || !Array.isArray(value) || value.length <= 0)
                    return value;
                var val = value.filter(function (item) {
                    return !inClientExc(test, item);
                });
                if (val.length > 0)
                    return val;
                return undefined;
            })
            .setValue('themes/' + name, themes)
            .fallback('libs/' + name, {})
            .fallback('themes/' + name, 'none');
    }

    (libs || []).forEach(transcribeSingle);

    clients
        .exclude('libs', function (key, file, test) {
            return inClientExc(test, key);
        })
        .exclude('themes', function (key, file, test) {
            return inClientExc(test, key);
        });
}

function isDefaultLibPath(name, dist) {
    var dist = normalize(dist);
    var expected = normalize(path.join('dist', name));
    logger.debug('isDefault: ' + dist + ' === ' + expected);
    return (dist === expected)
        || (dist === expected + '.js');
}

function normalize(relpath) {
    return path.normalize(relpath).replace(/\\/g, '/');
}

function isDependencyIncluded(dep) {
    if (dep.unify.exists)
        dep.unify.loadSync();
    var exclusions = dep.unify.getValue('client/exclude');
    return !exclusions || exclusions.indexOf('self') < 0;
}

function inClientExc(test, name) {
    var exc = test.exclude;
    if (!Array.isArray(exc) || exc.length <= 0)
        return false;
    return exc.indexOf(name) > -1;
}

module.exports = transcribe;