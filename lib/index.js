var commands = require('./commands/index'),
    renderer = require('./renderer/index'),
    JsonFile = require('./jsonfile/index'),
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
    JsonFile: JsonFile
};