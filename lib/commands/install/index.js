var optimist = require('optimist'),
    bower = require('bower'),
    Promise = require('bluebird'),
    Library = require('../../Library');

function Install(renderer, unify) {
    this.renderer = renderer;
    this.unify = unify;
    this.mylib = new Library(this.unify, this.renderer);
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
    if (!libs || libs.length <= 0) {
        libs = undefined;
        options = undefined;
    }
    return new Promise(function (resolve, reject) {
        bower.commands
            .install(libs, options)
            .on('error', function (err) {
                reject(err);
            })
            .on('end', function (installed) {
                resolve(installed);
            });
    });
};
Install.prototype._loadClientFile = function () {
    this.renderer.debug('Ensuring current library.');
    return this.mylib.ensure();
};
Install.prototype._installToClient = function (libs) {
    var _this = this;
    return libs.reduce(function (agg, cur) {
        return agg.then(function () {
            return _this.mylib.install(cur);
        });
    }, Promise.resolve(this));
};

module.exports = Install;