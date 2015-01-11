var path = require('path'),
    Promise = require('bluebird'),
    logger = require('../logger')(),
    JsonFile = require('../JsonFile'),
    BowerFile = require('../BowerFile'),
    defaults = require('../defaults'),
    isString = require('../isString');

function Clients(unify) {
    this.unify = unify;
    this.tests = normalizeTests(unify);
    this._init();
}
Clients.prototype._init = function () {
    var tests = this.tests;
    if (!tests)
        return;
    var paths = tests.map(function (test) {
        return test.file;
    });
    this.files = paths.map(function (path) {
        return new JsonFile(path);
    });
};

Clients.prototype.reset = function () {
    var _this = this;
    return this.ensure()
        .tap(function () {
            _this.setValue('libs', {})
                .setValue('themes', {});
        });
};
Clients.prototype.ensure = function () {
    if (!this.files)
        return Promise.resolve(this);
    return Promise.all(this.files.map(function (file) {
        if (file.exists) {
            logger.debug('Loading file. [' + file.path + ']');
            return file.load();
        } else {
            logger.debug('Creating missing file. [' + file.path + ']');
            return file
                .setValue('libs', {})
                .setValue('themes', {})
                .setValue('debug', defaults.client.debug())
                .save();
        }
    }));
};
Clients.prototype.load = function () {
    if (!this.files)
        return Promise.resolve(this);
    return Promise.all(this.files.map(function (file) {
        return file.load();
    }));
};
Clients.prototype.save = function () {
    if (!this.files)
        return Promise.resolve(this);
    return Promise.all(this.files.map(function (file) {
        return file.save();
    }));
};
Clients.prototype.setValue = function (jsonPath, value) {
    if (!this.files)
        return this;
    this.files.forEach(function (file) {
        file.setValue(jsonPath, value);
    });
    return this;
};
Clients.prototype.setPathValue = function (jsonPath, relative, libName) {
    if (!relative)
        return this.setValue(jsonPath, undefined);
    if (!this.files)
        return this;
    var tests = this.tests;
    var _this = this;
    this.files.forEach(function (file, i) {
        var test = tests[i];
        var froot = path.resolve(path.dirname(file.path));
        var lroot = path.join(_this.findBowerLib(test), libName);
        var browserPath = makeCleanPath(path.join(path.relative(froot, lroot), relative));
        file.setValue(jsonPath, browserPath);
    });
    return this;
};
Clients.prototype.fallback = function (jsonPath, fallbackValue) {
    if (!this.files)
        return this;
    this.files.forEach(function (file) {
        file.fallback(jsonPath, fallbackValue);
    });
    return this;
};
Clients.prototype.remove = function (jsonPath) {
    if (!this.files)
        return this;
    this.files.forEach(function (file) {
        file.remove(jsonPath);
    });
    return this;
};
Clients.prototype.anyHave = function (jsonPath) {
    if (!this.files)
        return false;
    return this.files.some(function (file) {
        return file.getValue(jsonPath) != null;
    });
};

Clients.prototype.findBowerLib = function (test) {
    if (!test.lib)
        return path.join(BowerFile.getLibDir(this.unify));
    return test.lib;
};

function normalizeTests(unify) {
    if (!unify)
        return null;
    var tests = unify.getValue('client/tests');
    if (!tests)
        return null;
    return tests.map(function (test) {
        if (isString(test))
            return {file: test};
        return test;
    });
}

function makeCleanPath(relpath) {
    return path.normalize(relpath).replace(/\\/g, '/');
}

module.exports = Clients;