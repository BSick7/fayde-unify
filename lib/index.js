var commands = require('./commands/index'),
    renderer = require('./renderer/index'),
    Unify = require('./unify/index'),
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

function unify(path) {
    return new Unify(path);
}

module.exports = {
    version: pkg.version,
    interactive: interactive,
    unify: unify,
    commands: commands,
    renderer: renderer,
    Unify: Unify
};