var Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    BowerHelper = require('./BowerHelper'),
    JsonFile = require('../JsonFile'),
    ClientFiles = require('./ClientFiles'),
    install = require('./install'),
    uninstall = require('./uninstall');

function Library(unifyOrName, renderer) {
    this.renderer = renderer;
    if (unifyOrName instanceof JsonFile) {
        this.unify = unifyOrName;
        this.name = this.unify.getValue('name');
    } else if (typeof unifyOrName === 'string') {
        this.name = unifyOrName;
    }
    this.bower = new BowerHelper(this);
}
Object.defineProperties(Library.prototype, {
    "client": {
        get: function () {
            if (this._client)
                return this._client;
            if (!this.unify)
                return this._client = new ClientFiles(['fayde.json']);
            var basePath = path.dirname(this.unify.path);
            var paths = this.unify.getValue('client/files')
                .map(function (p) {
                    return path.join(basePath, p);
                });
            return this._client = new ClientFiles(paths, this.renderer);
        }
    }
});
Library.prototype.ensure = function () {
    return this.client.ensure();
};
Library.prototype.load = function () {
    return this.client.load();
};
Library.prototype.save = function () {
    return this.client.save();
};
Library.prototype.install = function (name) {
    return install(this, this.createDependent(name));
};
Library.prototype.uninstall = function (name) {
    return uninstall(this, this.createDependent(name));
};
Library.prototype.createDependent = function (name) {
    var lib = new Library(name);
    lib.unify = new JsonFile(path.join(this.bower.getLibraryDir(lib), 'unify.json'));
    lib.parent = this;
    return lib;
};

module.exports = Library;