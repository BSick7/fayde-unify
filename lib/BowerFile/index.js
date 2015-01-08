var path = require('path'),
    bowerConfig = require('bower-config'),
    JsonFile = require('../JsonFile'),
    DEFAULT_BOWER_DIR = "bower_components";

function BowerFile(lib) {
    this.lib = lib;
}
Object.defineProperties(BowerFile.prototype, {
    "libDir": {
        get: function () {
            if (!this._libdir) {
                var bc = bowerConfig.read(path.dirname(this.lib.unify.path));
                this._libdir = bc.directory || DEFAULT_BOWER_DIR;
            }
            return this._libdir;
        }
    },
    "file": {
        get: function () {
            if (this._file)
                return this._file;
            var baseDir = path.dirname(unifyPath);
            var file = this._file = new JsonFile(path.join(baseDir, 'bower.json'));
            if (file.exists)
                return file;
            file = new JsonFile(path.join(baseDir, '.bower.json'));
            if (file.exists)
                this._file = file;
            return file;
        }
    }
});
BowerFile.prototype.getLibraryDir = function (lib) {
    return path.join(this.libDir, lib.name);
};

module.exports = BowerFile;