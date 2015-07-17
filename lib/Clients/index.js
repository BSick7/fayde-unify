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
Clients.prototype.setValue = function (jsonPath, value, contextor) {
    if (!this.files)
        return this;
    var tests = this.tests;
    this.files.forEach(function (file, i) {
        if (contextor)
            value = contextor(value, file, tests[i]);
        file.setValue(jsonPath, value);
    });
    return this;
};
Clients.prototype.setPathValue = function (jsonPath, relative, libName) {
    if (!relative)
        return this.setValue(jsonPath, undefined);
    var _this = this;
    return this.setValue(jsonPath, relative, function (value, file, test) {
        var froot = path.resolve(path.dirname(file.path));
        var bl = _this.findBowerLib(test);
        var lroot = (!bl) ? libName : (!libName ? bl : path.join(bl, libName));
        logger.log("Setting path value [" + froot + "] --> [" + lroot + "]");
        return makeCleanPath(path.join(path.relative(froot, lroot), value));
    });
};
Clients.prototype.exclude = function (jsonPath, excluder) {
    if (!this.files || !excluder)
        return this;
    var tests = this.tests;
    this.files.forEach(function (file, i) {
        var val = file.getValue(jsonPath);
        if (!val || val !== Object(val))
            return;
        var test = tests[i];
        Object.keys(val)
            .filter(function (key) {
                return excluder(key, file, test);
            })
            .map(function (key) {
                return jsonPath + '/' + key;
            })
            .forEach(function (jp) {
                logger.debug('Removing [' + jp + '] from ' + file.path);
                file.remove(jp);
            });
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