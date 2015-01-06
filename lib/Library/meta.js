var path = require('path');

module.exports = function (sourceLib, lib) {
    return function () {
        var dist = lib.unify.getValue('dist');
        if (dist) {
            if (dist.substr(dist.length - 3) === '.js')
                dist = dist.substr(0, dist.length - 3);
            dist = path.join(sourceLib.bower.getLibraryDir(lib), dist);
        }

        var exclusions = lib.unify.getValue('client/exclude') || [];

        return {
            name: lib.unify.getValue('name') || lib.name,
            isSelfExcluded: exclusions.indexOf('self') > -1,
            isDepsExcluded: exclusions.indexOf('deps') > -1,
            dist: dist,
            exports: lib.unify.getValue('library/exports')
        };
    };
};