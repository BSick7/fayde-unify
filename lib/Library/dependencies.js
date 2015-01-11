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

    function addIncluded(lib, list) {
        list = list || [];
        if (!lib.unify.exists)
            return list;
        lib.unify.loadSync();
        var exclusions = lib.unify.getValue('client/exclude');
        var excself = (!!exclusions && exclusions.indexOf('self') > -1);
        var excdeps = (!!exclusions && exclusions.indexOf('deps') > -1);

        if (!excself && !isInList(list, lib))
            list.push(lib);
        if (!excdeps) {
            (lib.bowerDeps = getDependenciesSync(lib).map(createDep))
                .forEach(function (cur) {
                    addIncluded(cur, list);
                });
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
        included: function () {
            return addIncluded(sourceLib);
        }
    }
}

module.exports = create;