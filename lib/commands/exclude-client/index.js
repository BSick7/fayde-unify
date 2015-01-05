var optimist = require('optimist'),
    Promise = require('bluebird');

function ExcludeClient(renderer, unify) {
    this.renderer = renderer;
    this.unify = unify;
}
ExcludeClient.prototype.interactive = function (args) {
    var argv = optimist
        .boolean(['off'])
        .parse(args || "");
    return this.run({
        options: {
            off: argv['off'] === true
        }
    });
};
ExcludeClient.prototype.run = function (settings) {
    return Promise.resolve(this)
        .tap(function (ec) {
            return ec.unify.load();
        })
        .tap(function (ec) {
            if (settings.options['off'])
                return ec.unify.remove('exclude-client').save();
            return ec.unify.setValue('exclude-client', true).save();
        });
};

module.exports = ExcludeClient;