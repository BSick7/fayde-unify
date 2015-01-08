var Promise = require('bluebird'),
    logger = require('../logger')(),
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

function run(command, unify) {
    logger.debug('Running interactive command. [' + command + ']');
    command = (command || 'help').toLowerCase();
    if (all.indexOf(command) > -1) {
        var CmdClass = require('./' + command);
        var cmd = new CmdClass(unify);
        return cmd.interactive(process.argv.slice(3));
    }
    return Promise.reject('Could not find command. [' + command + ']')
}

function factory(cmdPath) {
    return function (settings, done) {
        settings = settings || {};
        var cmd = createCommand(cmdPath, settings.unify);
        return cmd.run(settings)
            .then(function () {
                done();
            }, function (err) {
                done(err);
            })
            .then(function () {
                return cmd;
            });
    };
}
function createCommand(cmdPath, unifyPath) {
    var unify = new JsonFile(unifyPath || 'unify.json');
    var CmdClass = require(cmdPath);
    return new CmdClass(unify);
}

module.exports = {
    run: run,
    init: factory('./init'),
    install: factory('./install'),
    uninstall: factory('./uninstall'),
    update: factory('./update'),
    exclude: factory('./exclude')
};