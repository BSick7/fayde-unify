var optimist = require('optimist'),
    Promise = require('bluebird'),
    JsonFile = require('../../JsonFile'),
    logger = require('../../logger')();

function Bower(unify) {
    this.unify = unify;
}
Bower.prototype.interactive = function (args) {
    return this.run({
        options: {}
    });
};
Bower.prototype.run = function (settings) {
    settings.options = settings.options || {};
    var bowerrc = new JsonFile('.bowerrc');
    return Promise.resolve(this)
        .tap(function () {
            if (bowerrc.exists)
                return bowerrc.load();
        })
        .tap(function () {
            return bowerrc.setValue('scripts/postinstall', 'unify update')
                .setValue('scripts/preuninstall', 'unify update -un %')
                .save();
        });
};

module.exports = Bower;