var path = require('path'),
    Promise = require('bluebird'),
    logger = require('../logger')(),
    JsonFile = require('../JsonFile'),
    defaults = require('../defaults');

function Clients(tests) {
    if (tests) {
        this.tests = tests;
        var paths = tests.map(function (test) {
            return test.file;
        });
        this.files = paths.map(function (path) {
            return new JsonFile(path);
        });
    }
}
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
Clients.prototype.setPathValue = function (jsonPath, relative, name) {
    if (!relative)
        return this.setValue(jsonPath, undefined);
    if (!this.files)
        return this;
    var tests = this.tests;
    this.files.forEach(function (file, i) {
        var test = tests[i];
        var froot = path.resolve(path.dirname(file.path));
        var browserPath;
        if (!test.lib) {
            var proot = path.resolve(relative);
            browserPath = makeCleanPath(path.relative(froot, proot));
        } else {
            var proot = path.join(applyLibTemplate(test.lib, name), relative);
            browserPath = makeCleanPath(path.relative(froot, proot));
        }
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

function applyLibTemplate(lib, name) {
    return (lib || "").replace(/\{\{name}}/g, name);
}
function makeCleanPath(relpath) {
    return path.normalize(relpath).replace(/\\/g, '/');
}

module.exports = Clients;