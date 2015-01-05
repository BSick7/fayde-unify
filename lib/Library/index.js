var path = require('path'),
    bower = require('bower'),
    JsonFile = require('../JsonFile'),
    DEFAULT_BOWER_DIR = "bower_components";

function Library(unifyOrName) {
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
    }
});
Library.prototype.ensure = function () {
    if (this.client.exists)
        return Promise.resolve(this.client);
    return this.client.save();
};
Library.prototype.install = function (name) {
    var lib = Library.findDependent(name);

};

Library.findDependent = function (name) {
    var lib = new Library(name);
    var bowerDir = bower.config.directory || DEFAULT_BOWER_DIR;
    lib.unify = new JsonFile(path.join(bowerDir, 'unify.json'));
    return lib;
};


module.exports = Library;