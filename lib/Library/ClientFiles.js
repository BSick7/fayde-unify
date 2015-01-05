var JsonFile = require('../JsonFile'),
    Promise = require('bluebird'),
    defaults = require('../defaults');

function ClientFiles(paths, renderer) {
    this.renderer = renderer;
    this.files = (paths || []).map(function (path) {
        return new JsonFile(path);
    });
}
ClientFiles.prototype.ensure = function () {
    if (!this.files)
        return Promise.resolve(this);
    var _this = this;
    return Promise.all(this.files.map(function (file) {
        if (file.exists) {
            _this.renderer.debug('Loading file. [' + file.path + ']');
            return file.load();
        } else {
            _this.renderer.debug('Creating missing file. [' + file.path + ']');
            return file.setValue('debug', defaults.client.debug()).save();
        }
    }))
};
ClientFiles.prototype.load = function () {
    if (!this.files)
        return Promise.resolve(this);
    return Promise.all(this.files.map(function (file) {
        return file.load();
    }));
};
ClientFiles.prototype.save = function () {
    if (!this.files)
        return Promise.resolve(this);
    return Promise.all(this.files.map(function (file) {
        return file.save();
    }));
};
ClientFiles.prototype.setValue = function (jsonPath, value) {
    if (!this.files)
        return;
    this.files.forEach(function (file) {
        file.setValue(jsonPath, value);
    });
};
ClientFiles.prototype.remove = function (jsonPath) {
    if (!this.files)
        return;
    this.files.forEach(function (file) {
        file.remove(jsonPath);
    });
};

module.exports = ClientFiles;