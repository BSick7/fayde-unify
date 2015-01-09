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

    function getUnshared(lib, metaname) {
        var ap = getAll(lib);
        var ac = getAll(lib, metaname);
        return intersection(ap, ac);
    }

    function getAll(lib, exclude) {
        var deps = getDependenciesSync(lib)
            .map(createDep)
            .map(function (dep) {
                if (dep.unify.exists)
                    dep.unify.loadSync();
                return dep;
            })
            .filter(function (dep) {
                var exclusions = dep.unify.getValue('client/exclude');
                return !exclusions || exclusions.indexOf('self') < 0;
            });
        if (exclude) {
            deps = deps.filter(function (dep) {
                var name = dep.unify.getValue('name') || dep.name;
                return exclude !== name;
            });
        }

        return deps.reduce(function (agg, dep) {
            var exclusions = dep.unify.getValue('client/exclude');
            if (exclusions && exclusions.indexOf('deps') > -1)
                return agg;
            return agg.concat(getAll(dep, exclude));
        }, deps);
    }

    return {
        lib: function () {
            return getDependenciesSync(sourceLib)
        },
        all: getAll,
        unshared: getUnshared
    }
}

function intersection(a, b) {
    return a.filter(function (cur) {
        return b.some(function (cur2) {
            return cur === cur2;
        })
    });
}

module.exports = create;