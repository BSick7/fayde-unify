var commands = require('./commands'),
    renderer = require('./renderer'),
    Unify = require('./unify');

exports.interactive = function (argv, config, unify) {
    var rend = getRenderer(config);
    return commands.run(rend, argv._[0], argv, unify)
        .then(function (cmd) {
            rend.debug('Finished.');
        }, function (err) {
            rend.error(err);
        });
};

exports.unify = function (path) {
    return new Unify(path);
};

function getRenderer(config) {
    return new renderer.Standard(config);
}