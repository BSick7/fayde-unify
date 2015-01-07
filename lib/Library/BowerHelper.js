var fs = require('fs'),
    path = require('path'),
    Promise = require('bluebird'),
    bowerConfig = require('bower-config'),
    bowerJson = require('bower-json'),
    JsonFile = require('../JsonFile'),
    DEFAULT_BOWER_DIR = "bower_components";

function BowerHelper(lib) {
    this.lib = lib;
}
Object.defineProperties(BowerHelper.prototype, {
    "libDir": {
        get: function () {
            if (!this._libdir) {
                var bc = bowerConfig.read(path.dirname(this.lib.unify.path));
                this._libdir = bc.directory || DEFAULT_BOWER_DIR;
            }
            return this._libdir;
        }
    },
    "bowerFilepath": {
        get: function () {
            var trypath = path.join(path.dirname(this.lib.unify.path), 'bower.json');
            if (fs.existsSync(trypath))
                return trypath;
            var dotpath = path.join(path.dirname(this.lib.unify.path), '.bower.json');
            if (fs.existsSync(dotpath))
                return dotpath;
            return trypath;
        }
    }
});
BowerHelper.prototype.getLibraryDir = function (lib) {
    return path.join(this.libDir, lib.name);
};
BowerHelper.prototype.getDependencies = function () {
    var bpath = this.bowerFilepath;
    if (!fs.existsSync(bpath)) {
        this.lib.renderer.warn('Library does not have a bower.json file. [' + this.lib.name + '] [' + bpath + ']');
        return Promise.resolve([]);
    }
    return new Promise(function (resolve, reject) {
        bowerJson.read(bpath, function (err, json) {
            if (err)
                return reject(err);
            resolve(Object.keys(json.dependencies || {}));
        });
    });
};
BowerHelper.prototype.getDependenciesSync = function () {
    var file = new JsonFile(this.bowerFilepath);
    if (!file.exists) {
        this.lib.renderer.warn('Library does not have a bower.json file. [' + this.lib.name + '] [' + bpath + ']');
        return [];
    }
    file.loadSync();
    return Object.keys(file.getValue('dependencies') || {});
};

module.exports = BowerHelper;