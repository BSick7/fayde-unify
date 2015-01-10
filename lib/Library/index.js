var Promise = require('bluebird'),
    path = require('path'),
    logger = require('../logger')(),
    BowerFile = require('../BowerFile'),
    JsonFile = require('../JsonFile'),
    Clients = require('../Clients'),
    dependencies = require('./dependencies'),
    add = require('./add'),
    remove = require('./remove');

function Library(unifyOrName) {
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
            return this._clients = new Clients(this.unify);
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
    if (name) {
        logger.info('Updating records for [' + name + ']...');
        return add(this, this.createDependent(name));
    }
    logger.info('Updating all records');
    return add.all(this);
};
Library.prototype.uninstall = function (name) {
    if (!name) {
        logger.warn('No library specified to uninstall.');
        return;
    }
    return remove(this, this.createDependent(name));
};
Library.prototype.createDependent = function (name) {
    var index = name.indexOf('#');
    if (index > -1)
        name = name.substr(0, index);
    var lib = new Library(name);
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

        var themes = this.unify.getValue('themes') || undefined;
        if (themes) {
            themes = JSON.parse(JSON.stringify(themes));
        }

        clients.setValue('libs/' + name + '/exports', exports)
            .setPathValue('libs/' + name + '/path', dist, name)
            .setValue('themes/' + name, themes)
            .fallback('libs/' + name, {})
            .fallback('themes/' + name, {});

        logger.debug('Added self to fayde.json.');
    }
    return clients;
};
Library.prototype.init = function (settings) {
    return this.unify
        .setValue('name', settings.name)
        .setValue('client/tests', settings.tests)
        .setValue('type', settings.type)
        .setValue('dist', settings.dist || undefined)
        .setValue('library', settings.library || undefined)
        .setValue('typings', settings.typings)
        .save();
};

module.exports = Library;