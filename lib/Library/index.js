var Promise = require('bluebird'),
    path = require('path'),
    logger = require('../logger')(),
    BowerFile = require('../BowerFile'),
    JsonFile = require('../JsonFile'),
    Clients = require('../Clients'),
    dependencies = require('./dependencies'),
    transcribe = require('./transcribe');

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
Library.prototype.updateClients = function () {
    logger.debug("Collecting dependencies...");
    this.clients
        .setValue('libs', {})
        .setValue('themes', {});
    transcribe(this.dependencies.included(), this.clients);
    return this.clients.save();
};
Library.prototype.createDependent = function (name) {
    var index = name.indexOf('#');
    if (index > -1)
        name = name.substr(0, index);
    var lib = new Library(name);
    lib.unify = new JsonFile(path.join(this.bower.getLibraryDir(lib), 'unify.json'));
    return lib;
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