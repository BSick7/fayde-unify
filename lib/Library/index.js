var Promise = require('bluebird'),
    path = require('path'),
    BowerFile = require('../BowerFile'),
    JsonFile = require('../JsonFile'),
    Clients = require('../Clients'),
    dependencies = require('./dependencies'),
    install = require('./install'),
    installAll = require('./installAll'),
    uninstall = require('./uninstall'),
    isString = require('../isString');

function Library(unifyOrName, renderer) {
    this.renderer = renderer;
    if (unifyOrName instanceof JsonFile) {
        this.unify = unifyOrName;
        this.name = this.unify.getValue('name');
    } else {
        this.name = (unifyOrName || "").toString();
    }
    this.bower = new BowerFile(this);
    this.dependencies = dependencies(this);
}
Object.defineProperties(Library.prototype, {
    "clients": {
        get: function () {
            if (this._clients)
                return this._clients;
            var tests;
            if (this.unify) {
                tests = this.unify.getValue('client/tests') || undefined;
                if (tests) {
                    tests = tests.map(function (test) {
                        if (isString(test))
                            return {file: test};
                        return test;
                    });
                }
            }
            return this._clients = new Clients(tests, this.renderer);
        }
    }
});
Library.prototype.ensure = function () {
    return this.clients.ensure();
};
Library.prototype.load = function () {
    return this.clients.load();
};
Library.prototype.save = function () {
    return this.clients.save();
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
    var index = name.indexOf('#');
    if (index > -1)
        name = name.substr(0, index);
    var lib = new Library(name, this.renderer);
    lib.unify = new JsonFile(path.join(this.bower.getLibraryDir(lib), 'unify.json'));
    return lib;
};
Library.prototype.initClient = function () {
    var clients = this.clients;
    if (this.unify && this.unify.getValue('type') !== 'app') {
        var name = this.unify.getValue('name') || this.name;
        var exclusions = this.unify.getValue('client/exclude') || [];
        if (exclusions.indexOf('self') > -1) {
            return clients.remove('libs/' + name)
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

        clients.setValue('libs/' + name + '/exports', exports)
            .setPathValue('libs/' + name + '/path', dist, name)
            .fallback('libs/' + name, {})
            .fallback('themes/' + name, {});

        this.renderer.debug('Added self to fayde.json.');
    }
    return clients;
};

module.exports = Library;