var Promise = require('bluebird'),
    path = require('path'),
    BowerHelper = require('./BowerHelper'),
    JsonFile = require('../JsonFile'),
    ClientFiles = require('./ClientFiles'),
    install = require('./install'),
    installAll = require('./installAll'),
    uninstall = require('./uninstall');

function Library(unifyOrName, renderer) {
    this.renderer = renderer;
    if (unifyOrName instanceof JsonFile) {
        this.unify = unifyOrName;
        this.name = this.unify.getValue('name');
    } else {
        this.name = (unifyOrName || "").toString();
    }
    this.bower = new BowerHelper(this);
}
Object.defineProperties(Library.prototype, {
    "client": {
        get: function () {
            if (this._client)
                return this._client;
            var paths = ['fayde.json'];
            if (this.unify) {
                var basePath = path.dirname(this.unify.path);
                paths = this.unify.getValue('client/files')
                    .map(function (p) {
                        return path.join(basePath, p);
                    });
            }
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
    var exclusions = this.unify.getValue('client/exclude') || [];
    if (exclusions.indexOf('deps') > -1)
        return Promise.resolve(this);
    if (name)
        return install(this, this.createDependent(name));
    return installAll(this);
};
Library.prototype.uninstall = function (name) {
    if (!name) {
        this.renderer.warn('No library specified to uninstall.');
        return;
    }
    return uninstall(this, this.createDependent(name));
};
Library.prototype.createDependent = function (name) {
    var lib = new Library(name, this.renderer);
    lib.unify = new JsonFile(path.join(this.bower.getLibraryDir(lib), 'unify.json'));
    return lib;
};
Library.prototype.initClient = function () {
    var client = this._client;
    if (this.unify && this.unify.getValue('type') !== 'app') {
        var name = this.unify.getValue('name') || this.name;
        var exclusions = this.unify.getValue('client/exclude') || [];
        if (exclusions.indexOf('self') > -1) {
            return client.remove('libs/' + name)
                .remove('themes/' + name);
        }
        var exports = this.unify.getValue('library/exports') || undefined;
        var dist = this.unify.getValue('dist') || undefined;
        if (dist) {
            var expected = path.resolve(path.join('dist', name));
            var full = path.resolve(dist);
            if (full === expected || full === (expected + '.js'))
                dist = undefined;
        }

        client.setValue('libs/' + name + '/exports', exports)
            .setPathValue('libs/' + name + '/path', dist)
            .fallback('libs/' + name, {})
            .fallback('themes/' + name, {});

        this.renderer.debug('Added self to fayde.json.');
    }
    return client;
};

module.exports = Library;