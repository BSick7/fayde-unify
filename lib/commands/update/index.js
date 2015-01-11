var optimist = require('optimist'),
    Promise = require('bluebird'),
    Library = require('../../Library');

function Update(unify) {
    this.unify = unify;
}
Update.prototype.interactive = function (args) {
    var argv = optimist
        .boolean(['un'])
        .parse(args || "");
    return this.run({
        libs: argv._,
        options: {
            un: argv['un']
        }
    });
};
Update.prototype.run = function (settings) {
    settings.options = settings.options || {};
    var lib = new Library(this.unify);
    return Promise.resolve(this)
        .tap(function (update) {
            return lib.unify.load();
        })
        .tap(function (update) {
            return lib.updateClients();
        });
};


module.exports = Update;