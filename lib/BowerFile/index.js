var path = require('path'),
    JsonFile = require('../JsonFile'),
    DEFAULT_BOWER_DIR = "bower_components";

function BowerFile(lib) {
    this.lib = lib;
}
BowerFile.getLibDir = function (unify) {
    var bowerrc = new JsonFile(path.dirname(unify.path));
    if (bowerrc.exists)
        bowerrc.loadSync();
    return bowerrc.getValue('directory') || DEFAULT_BOWER_DIR;
};
Object.defineProperties(BowerFile.prototype, {
    "libDir": {
        get: function () {
            return this._libdir = this._libdir || BowerFile.getLibDir(this.lib.unify);
        }
    },
    "file": {
        get: function () {
            if (this._file)
                return this._file;
            var baseDir = path.dirname(this.lib.unify.path);
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