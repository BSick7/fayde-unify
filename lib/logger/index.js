var optimist = require('optimist'),
    Standard = require('./Standard');

function logger(config) {
    if (!config) {
        var argv = optimist.boolean(['v', 'verbose']).argv;
        config = {
            verbose: argv.v || argv.verbose
        };
    }
    return new Standard(config);
}

module.exports = logger;