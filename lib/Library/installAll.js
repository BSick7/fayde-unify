var Promise = require('bluebird');

function installAll(sourceLib) {
    return sourceLib.bower.getDependencies()
        .then(function (depNames) {
            return Promise.all(depNames.map(function (depName) {
                return sourceLib.install(depName);
            }));
        });
}

module.exports = installAll;