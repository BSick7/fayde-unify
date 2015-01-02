var commands = require('./commands'),
    renderer = require('./renderer');

exports.interactive = function (argv, config, unify) {
    var rend = getRenderer(config);
    return commands.run(rend, argv._[0], argv, unify);
};

function getRenderer(config) {
    return new renderer.Standard(config);
}