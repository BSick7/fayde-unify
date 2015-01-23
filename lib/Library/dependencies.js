var Promise = require('bluebird'),
    logger = require('../logger')();

function create(sourceLib) {
    function createDep(depName) {
        return sourceLib.createDependent(depName);
    }

    function getDependenciesSync(lib, includeDev) {
        var file = lib.bower.file;
        if (!file.exists) {
            logger.warn('Library does not have a bower.json file. [' + lib.name + '] [' + file.path + ']');
            return [];
        }
        file.loadSync();
        var normal = Object.keys(file.getValue('dependencies') || {});
        if (!includeDev)
            return normal;
        var dev = Object.keys(file.getValue('devDependencies') || {})
            .filter(function (devdep) {
                return normal.indexOf(devdep) === -1;
            });
        return normal.concat(dev);
    }

    function addIncluded(lib, list, excluded, includeDev) {
        list = list || [];
        var excself = false;
        var excdeps = false;
        if (lib.unify.exists) {
            lib.unify.loadSync();
            var exclusions = lib.unify.getValue('client/exclude');
            if (exclusions) {
                excself = exclusions.indexOf('self') > -1;
                excdeps = exclusions.indexOf('deps') > -1;
                var rawexc = exclusions.reduce(function (agg, cur) {
                    if (Array.isArray(cur))
                        return agg.concat(cur);
                    return agg;
                }, []);
                excluded = excluded.concat(rawexc);
            }
        }
        if (!excself && !isInList(list, lib))
            list.push(lib);
        if (!excdeps) {
            (lib.bowerDeps = getDependenciesSync(lib, includeDev)
                .filter(function (depName) {
                    return excluded.indexOf(depName) < 0;
                })
                .map(createDep))
                .forEach(function (cur) {
                    addIncluded(cur, list, excluded, false);
                });
        } else {
            if (lib.bower.file.exists)
                lib.bower.file.loadSync();
        }
        return list;
    }

    function isInList(list, lib) {
        return list.some(function (cur) {
            return cur.name === lib.name;
        });
    }

    return {
        lib: function (includeDev) {
            return getDependenciesSync(sourceLib, includeDev)
        },
        included: function (excluded) {
            if (excluded.indexOf(sourceLib.name) > -1)
                return [];
            return addIncluded(sourceLib, [], excluded, true);
        }
    }
}

module.exports = create;