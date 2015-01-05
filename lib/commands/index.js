var Promise = require('bluebird'),
    all = [
        'init',
        'install',
        //'uninstall',
        //'help',
        'exclude-client'
    ];

exports.run = function (rend, command, unify) {
    rend.debug('Running interactive command. [' + command + ']');
    command = (command || 'help').toLowerCase();
    if (all.indexOf(command) > -1) {
        var CmdClass = require('./' + command);
        var cmd = new CmdClass(rend, unify);
        return cmd.interactive(process.argv.slice(3));
    }
    return Promise.reject('Could not find command. [' + command + ']')
};