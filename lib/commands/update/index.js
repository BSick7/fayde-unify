var optimist = require('optimist'),
    bower = require('bower'),
    Promise = require('bluebird'),
    asyncpromise = require('../../asyncpromise'),
    logger = require('../../logger')(),
    Library = require('../../Library');

function Update(unify) {
    this.unify = unify;
    this.mylib = new Library(this.unify);
}
Update.prototype.interactive = function (args) {
    var argv = optimist
        .boolean(['force-latest'])
        .parse(args || "");
    return this.run({
        libs: argv._,
        options: {
            forceLatest: argv['force-latest']
        }
    });
};
Update.prototype.run = function (settings) {
    if (!this.unify.exists) {
        return Promise.reject('Cannot find unify.json file. Run fayde init.');
    }
    settings.libs = settings.libs || [];
    settings.options = settings.options || {};
    return Promise.resolve(this)
        .tap(function (install) {
            return install.unify.load();
        })
        .tap(this._bowerUpdate.bind(this, settings.libs, settings.options))
        .tap(this._loadClientFile.bind(this))
        .tap(this._installToClient.bind(this, settings.libs))
        .tap(function (install) {
            return install.mylib.save();
        });
};
Update.prototype._bowerUpdate = function (libs, options) {
    options = {
        forceLatest: options.forceLatest === true
    };
    if (!libs || libs.length <= 0)
        libs = undefined;
    var libNames = libs ? libs.join(' ') : '';
    return new Promise(function (resolve, reject) {
        logger.auto('bower update ' + libNames);
        bower.commands
            .update(libs, options)
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
Update.prototype._loadClientFile = function () {
    logger.debug('Ensuring current library.');
    var mylib = this.mylib;
    return mylib.ensure()
        .then(function () {
            return mylib.initClient();
        });
};
Update.prototype._installToClient = function (libs) {
    var mylib = this.mylib;
    if (libs.length <= 0)
        return mylib.install();
    return asyncpromise.series(libs.map(function (lib) {
        return function () {
            return mylib.install(lib);
        };
    }));
};

module.exports = Update;