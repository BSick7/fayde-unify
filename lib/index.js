var commands = require('./commands'),
    renderer = require('./renderer'),
    JsonFile = require('./JsonFile'),
    Library = require('./Library'),
    pkg = require('../package.json');

function getRenderer(config) {
    return new renderer.Standard(config);
}

function interactive(command, config, unify) {
    var rend = getRenderer(config);
    return commands.run(rend, command, unify)
        .then(function (cmd) {
            rend.debug('Finished.');
        }, function (err) {
            rend.error(err);
        });
}

module.exports = {
    version: pkg.version,
    interactive: interactive,
    commands: commands,
    renderer: renderer,
    JsonFile: JsonFile,
    Library: Library
};