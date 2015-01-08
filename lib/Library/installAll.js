var Promise = require('bluebird');

function installAll(sourceLib) {
    var depNames = sourceLib.dependencies.lib();
    return Promise.all(depNames.map(function (depName) {
        return sourceLib.install(depName);
    }));
}

module.exports = installAll;