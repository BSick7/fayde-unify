var optimist = require('optimist'),
    Promise = require('bluebird'),
    Library = require('../../Library');

function Update(unify) {
    this.unify = unify;
}
Update.prototype.interactive = function (args) {
    var un = args.indexOf('-un') > -1;
    return this.run({
        libs: args.filter(function (arg) {
            return arg[0] !== '-';
        }),
        options: {
            un: un
        }
    });
};
Update.prototype.run = function (settings) {
    settings.options = settings.options || {};
    var lib = new Library(this.unify);
    var libs = settings.options.un === true ? settings.libs : undefined;
    return Promise.resolve(this)
        .tap(function (update) {
            return lib.unify.load();
        })
        .tap(function (update) {
            return lib.updateClients(libs);
        });
};


module.exports = Update;