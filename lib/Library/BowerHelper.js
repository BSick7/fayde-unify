var path = require('path'),
    bowerConfig = require('bower-config'),
    bowerJson = require('bower-json'),
    DEFAULT_BOWER_DIR = "bower_components";

function BowerHelper(lib) {
    this.lib = lib;
}
Object.defineProperties(BowerHelper.prototype, {
    "libDir": {
        get: function () {
            if (!this._libdir) {
                var bc = bowerConfig.read(path.dirname(this.unify.path));
                this._libdir = bc.directory || DEFAULT_BOWER_DIR;
            }
            return this._libdir;
        }
    },
    "bowerFilepath": {
        get: function () {
            return path.join(path.dirname(this.lib.unify.path), 'bower.json');
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

module.exports = BowerHelper;