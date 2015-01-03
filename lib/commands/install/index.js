var optimist = require('optimist'),
    bower = require('bower'),
    Promise = require('bluebird');

function Install(renderer, unify) {
    this.renderer = renderer;
    this.unify = unify;
}
Install.prototype.interactive = function (args) {
    var argv = optimist
        .boolean(['save', 'save-dev', 'force-latest'])
        .parse(args || "");
    return this.run(argv._, {
        save: argv['save'],
        saveDev: argv['save-dev'],
        forceLatest: argv['force-latest']
    });
};
Install.prototype.run = function (libs, options) {
    return Promise.resolve(this)
        .tap(function () {
            return bowerInstall(libs, options);
        })
        .tap(function () {
            return installToFayde(libs);
        });
};

function bowerInstall(libs, options) {
    return new Promise(function (resolve, reject) {
        bower.commands
            .install(libs, {
                save: options.save === true,
                saveDev: options.saveDev === true,
                forceLatest: options.forceLatest === true
            })
            .on('error', function (err) {
                reject(err);
            })
            .on('end', function (installed) {
                resolve(installed);
            });
    });
}

function installToFayde(libs) {
    //TODO: Implement
}

module.exports = Install;