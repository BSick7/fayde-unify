var all = [
    'init',
    //'install',
    //'uninstall',
    //'help'
];

exports.run = function (rend, command, args, unify) {
    rend.debug('Running interactive command. [' + command + ']');
    command = (command || 'help').toLowerCase();
    if (all.indexOf(command) > -1) {
        var CmdClass = require('./' + command);
        var cmd = new CmdClass(rend, unify);
        return cmd.interactive(args);
    }
    rend.error('Could not find command. [' + command + ']');
    return false;
};