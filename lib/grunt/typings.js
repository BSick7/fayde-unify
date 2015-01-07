var fs = require('fs'),
    path = require('path'),
    renderer = require('../renderer'),
    JsonFile = require('../JsonFile'),
    Library = require('../Library');

function getTypings(basePath, unify, isSelf) {
    var typings = unify.getValue('typings') || [];
    if (isSelf) {
        typings = typings.concat(unify.getValue('devTypings') || []);
    }
    var unifyDir = path.resolve(path.dirname(unify.path));
    return typings.map(function (typing) {
        return path.relative(basePath, path.join(unifyDir, typing));
    });
}

function getAllDependencies(sourceLib, lib) {
    lib = lib || sourceLib;
    return lib.bower.getDependenciesSync()
        .reduce(function (agg, cur) {
            var curlib = sourceLib.createDependent(cur);
            agg.push(curlib);
            return agg
                .concat([curlib])
                .concat(getAllDependencies(sourceLib, curlib));
        }, []);
}

module.exports = function (basePath, unifyPath) {
    unifyPath = unifyPath == null ? basePath : unifyPath;
    var unifyDir = unifyPath == null ? process.cwd() : unifyPath;
    var unify = new JsonFile(path.join(unifyDir, 'unify.json'));
    unify.loadSync();

    var typings = getTypings(basePath, unify, true);

    var lib = new Library(unify, new renderer.Standard());
    if (!fs.existsSync(lib.bower.bowerFilepath))
        return typings;

    return getAllDependencies(lib)
        .reduce(function (agg, cur) {
            return agg.concat(getTypings(basePath, cur.unify, false));
        }, typings);
};