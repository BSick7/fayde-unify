var optimist = require('optimist'),
    bower = require('bower'),
    Promise = require('bluebird'),
    asyncpromise = require('../../asyncpromise'),
    logger = require('../../logger')(),
    Library = require('../../Library');

function Install(unify) {
    this.unify = unify;
    this.mylib = new Library(this.unify);
}
Install.prototype.interactive = function (args) {
    var argv = optimist
        .boolean(['save', 'save-dev', 'force-latest'])
        .parse(args || "");
    return this.run({
        libs: argv._,
        options: {
            save: argv['save'],
            saveDev: argv['save-dev'],
            forceLatest: argv['force-latest']
        }
    });
};
Install.prototype.run = function (settings) {
    if (!this.unify.exists) {
        return Promise.reject('Cannot find unify.json file. Run fayde init.');
    }
    settings.libs = settings.libs || [];
    settings.options = settings.options || {};
    return Promise.resolve(this)
        .tap(function (install) {
            return install.unify.load();
        })
        .tap(this._bowerInstall.bind(this, settings.libs, settings.options))
        .tap(this._loadClientFile.bind(this))
        .tap(this._installToClient.bind(this, settings.libs))
        .tap(function (install) {
            return install.mylib.save();
        });
};
Install.prototype._bowerInstall = function (libs, options) {
    options = {
        save: options.save === true,
        saveDev: options.saveDev === true,
        forceLatest: options.forceLatest === true
    };
    if (!libs || libs.length <= 0)
        libs = undefined;
    var libNames = libs ? libs.join(' ') : '';
    return new Promise(function (resolve, reject) {
        logger.auto('bower install ' + libNames);
        bower.commands
            .install(libs, options)
            .on('data', function (data) {
                data && logger.log(data);
            })
            .on('error', function (err) {
                reject(err);
            })
            .on('end', function (installed) {
                resolve(installed);
            });
    });
};
Install.prototype._loadClientFile = function () {
    logger.debug('Ensuring current library.');
    var mylib = this.mylib;
    return mylib.ensure()
        .then(function () {
            return mylib.initClient();
        });
};
Install.prototype._installToClient = function (libs) {
    var mylib = this.mylib;
    if (libs.length <= 0)
        return mylib.install();
    return asyncpromise.series(libs.map(function (lib) {
        return function () {
            return mylib.install(lib);
        };
    }));
};

module.exports = Install;