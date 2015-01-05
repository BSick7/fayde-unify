var Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    bowerConfig = require('bower-config'),
    bowerJson = require('bower-json'),
    JsonFile = require('../JsonFile'),
    DEFAULT_BOWER_DIR = "bower_components";

function Library(unifyOrName, renderer) {
    this.renderer = renderer;
    if (unifyOrName instanceof JsonFile) {
        this.unify = unifyOrName;
        this.name = this.unify.getValue('name');
    } else if (typeof unifyOrName === 'string') {
        this.name = unifyOrName;
    }
}
Object.defineProperties(Library.prototype, {
    "client": {
        get: function () {
            if (!this._client) {
                if (this.unify)
                    this._client = new JsonFile(path.join(path.dirname(this.unify.path), this.unify.getValue('client') || 'fayde.json'));
                else
                    this._client = new JsonFile('fayde.json');
            }
            return this._client;
        }
    },
    "bowerDir": {
        get: function () {
            if (!this._libdir) {
                var bc = bowerConfig.read(path.dirname(this.unify.path));
                this._libdir = bc.directory || DEFAULT_BOWER_DIR;
            }
            return this._libdir;
        }
    }
});
Library.prototype.ensure = function () {
    if (!this.client.exists) {
        return this.client.save()
            .then(this.load.bind(this));
    }
    return this.load();
};
Library.prototype.load = function () {
    return this.client.load();
};
Library.prototype.install = function (name) {
    var lib = this.createDependent(name);
    if (!lib.unify.exists) {
        this.renderer.warn('Library does not have a unify.json file. [' + lib.name + ']');
        this.client
            .setValue('libs/' + name, {})
            .setValue('themes/' + name, "none");
        return this.installDependencies(lib);
    }

    return lib.unify.load()
        .then(this.transposeLibMeta.bind(this, lib))
        .then(this.installDependencies.bind(this, lib))
};
Library.prototype.save = function () {
    if (this.client.exists)
        return this.client.save();
    return Promise.reject('Client file does not exist. [' + this.client.path + ']');
};
Library.prototype.getBowerLibDir = function (lib) {
    return path.join(this.bowerDir, lib.name);
};
Library.prototype.createDependent = function (name) {
    var lib = new Library(name);
    lib.unify = new JsonFile(path.join(this.getBowerLibDir(lib), 'unify.json'));
    return lib;
};
Library.prototype.transposeLibMeta = function (lib) {
    if (lib.isExcluded('self')) {
        this.renderer.debug('Excluded library from fayde.json. [' + lib.name + ']');
        return;
    }

    var exports = lib.unify.getValue('library/exports');
    if (exports)
        this.client.setValue('libs/' + lib.name + '/exports', exports);

    var dist = lib.unify.getValue('dist');
    if (dist) {
        if (dist.substr(dist.length - 3) === '.js')
            dist = dist.substr(0, dist.length - 3);
        this.client.setValue('libs/' + lib.name + '/path', path.join(this.getBowerLibDir(lib), dist));
    }
};
Library.prototype.installDependencies = function (lib) {
    var _this = this;
    var client = this.client;
    return this.findLibraryDependencies(lib)
        .then(function (libNames) {
            if (!libNames || libNames.length <= 0)
                return;
            if (!lib.isExcluded('self'))
                client.setValue('libs/' + lib.name + '/deps', libNames);
            if (lib.isExcluded('deps')) {
                _this.renderer.debug('Excluded library dependencies from fayde.json. [' + lib.name + ']');
                return Promise.resolve(_this);
            }
            return Promise.all(libNames.map(function (libName) {
                return _this.install(libName);
            }));
        });
};
Library.prototype.findLibraryDependencies = function (lib) {
    var bpath = path.join(this.getBowerLibDir(lib), 'bower.json');
    if (!fs.existsSync(bpath)) {
        this.renderer.warn('Library does not have a bower.json file. [' + lib.name + '] [' + bpath + ']');
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
Library.prototype.isExcluded = function (item) {
    var exclusions = this.unify.getValue('client/exclude');
    if (!exclusions)
        return false;
    return exclusions.indexOf(item) > -1;
};

module.exports = Library;