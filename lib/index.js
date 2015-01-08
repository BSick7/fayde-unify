var commands = require('./commands'),
    logger = require('./logger')(),
    JsonFile = require('./JsonFile'),
    Library = require('./Library'),
    pkg = require('../package.json');

function interactive(command, unify) {
    return commands.run(command, unify)
        .then(function (cmd) {
            logger.debug('Finished.');
        }, function (err) {
            logger.error(err);
        });
}

module.exports = {
    version: pkg.version,
    interactive: interactive,
    commands: commands,
    JsonFile: JsonFile,
    Library: Library
};