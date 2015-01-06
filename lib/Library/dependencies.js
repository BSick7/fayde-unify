var Promise = require('bluebird');

function getUnshared(sourceLib, lib, meta) {
    var ap = [];
    var ac = [];
    return Promise.all([
        getAll(sourceLib, lib)
            .then(function (deps) {
                ap = deps;
            }),
        getAll(sourceLib, lib, meta.name)
            .then(function (deps) {
                ac = deps;
            })
    ]).then(function () {
        return intersection(ap, ac);
    });
}

function getAll(sourceLib, lib, exclude) {
    function createDep(depName) {
        return sourceLib.createDependent(depName);
    }

    function getLibDeps(dep) {
        return getAll(sourceLib, dep, exclude);
    }

    function loadMany(libs) {
        return Promise.resolve(libs)
            .tap(function (all) {
                return Promise.all(all.map(function (cur) {
                    if (cur.unify.exists)
                        return cur.unify.load();
                }));
            });
    }

    function filterExcluded(deps) {
        if (!exclude)
            return deps;
        return deps.filter(function (cur) {
            var name = cur.unify.getValue('name') || cur.name;
            return exclude !== name;
        });
    }

    var all = [];
    return lib.bower.getDependencies()
        .then(function (depNames) {
            return loadMany(depNames.map(createDep));
        })
        .then(filterExcluded)
        .then(function (deps) {
            all = all.concat(deps);
            return Promise.all(deps.map(getLibDeps));
        })
        .then(function () {
            return all;
        });
}

function intersection(a, b) {
    return a.filter(function (cur) {
        return b.some(function (cur2) {
            return cur === cur2;
        })
    });
}

module.exports = {
    getUnshared: getUnshared,
    getAll: getAll
};