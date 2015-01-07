var optimist = require('optimist'),
    Promise = require('bluebird');

function ExcludeClient(renderer, unify) {
    this.renderer = renderer;
    this.unify = unify;
}
ExcludeClient.prototype.interactive = function (args) {
    var argv = optimist
        .boolean(['off', 'self', 'deps'])
        .parse(args || "");
    return this.run({
        options: {
            off: argv['off'],
            self: argv['self'],
            deps: argv['deps']
        }
    });
};
ExcludeClient.prototype.run = function (settings) {
    settings.options = settings.options || {};
    return Promise.resolve(this)
        .tap(function (ec) {
            return ec.unify.load();
        })
        .tap(function (ec) {
            var exclusions = ec.unify.getValue('client/exclude');
            if (!exclusions || !Array.isArray(exclusions))
                exclusions = [];
            var func = (settings.options['off'] === true) ? removeItem : addItem;
            if (settings.options['self'] === true)
                func(exclusions, 'self');
            if (settings.options['deps'] === true)
                func(exclusions, 'deps');
            if (exclusions.length <= 0)
                ec.unify.remove('client/exclude');
            else
                ec.unify.setValue('client/exclude', exclusions);
            return ec.unify.save();
        });
};

function addItem(arr, item) {
    var index = arr.indexOf(item);
    if (index < 0)
        arr.push(item);
}

function removeItem(arr, item) {
    var index = arr.indexOf(item);
    if (index < 0)
        return;
    arr.splice(index, 1);
}

module.exports = ExcludeClient;