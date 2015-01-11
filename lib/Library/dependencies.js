var Promise = require('bluebird'),
    logger = require('../logger')();

function create(sourceLib) {
    function createDep(depName) {
        return sourceLib.createDependent(depName);
    }

    function getDependenciesSync(lib) {
        var file = lib.bower.file;
        if (!file.exists) {
            logger.warn('Library does not have a bower.json file. [' + lib.name + '] [' + file.path + ']');
            return [];
        }
        file.loadSync();
        return Object.keys(file.getValue('dependencies') || {});
    }

    function addIncluded(lib, list, excluded) {
        list = list || [];
        var excself = false;
        var excdeps = false;
        if (lib.unify.exists) {
            lib.unify.loadSync();
            var exclusions = lib.unify.getValue('client/exclude');
            excself = (!!exclusions && exclusions.indexOf('self') > -1);
            excdeps = (!!exclusions && exclusions.indexOf('deps') > -1);
        }
        if (!excself && !isInList(list, lib))
            list.push(lib);
        if (!excdeps) {
            (lib.bowerDeps = getDependenciesSync(lib)
                .filter(function (depName) {
                    return excluded.indexOf(depName) < 0;
                })
                .map(createDep))
                .forEach(function (cur) {
                    addIncluded(cur, list, excluded);
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
        lib: function () {
            return getDependenciesSync(sourceLib)
        },
        included: function (excluded) {
            if (excluded.indexOf(sourceLib.name) > -1)
                return [];
            return addIncluded(sourceLib, [], excluded);
        }
    }
}

module.exports = create;