var Promise = require('bluebird'),
    renderer = require('../renderer'),
    JsonFile = require('../JsonFile'),
    all = [
        'init',
        'install',
        'uninstall',
        'update',
        //'prune',
        //'help',
        'exclude'
    ];

function run(rend, command, unify) {
    rend.debug('Running interactive command. [' + command + ']');
    command = (command || 'help').toLowerCase();
    if (all.indexOf(command) > -1) {
        var CmdClass = require('./' + command);
        var cmd = new CmdClass(rend, unify);
        return cmd.interactive(process.argv.slice(3));
    }
    return Promise.reject('Could not find command. [' + command + ']')
}

function factory(cmdPath) {
    return function (settings, done) {
        var cmd = createCommand(require(cmdPath), settings);
        return cmd(settings, done);
    };
}
function createCommand(CmdClass, settings) {
    var unify = new JsonFile(settings.unify || 'unify.json');
    var cmd = new CmdClass(new renderer.Standard(), unify);
    return function (settings, done) {
        return cmd.run(settings)
            .tap(function () {
                done();
            }, function (err) {
                done(err);
            });
    };
}

module.exports = {
    run: run,
    init: factory('./init'),
    install: factory('./install'),
    uninstall: factory('./uninstall'),
    update: factory('./update')
};