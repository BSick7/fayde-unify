var fs = require('fs'),
    Promise = require('bluebird');

function JsonFile(path) {
    this.path = path;
    this.json = {};
}

Object.defineProperties(JsonFile.prototype, {
    "exists": {
        get: function () {
            return fs.existsSync(this.path);
        }
    }
});

JsonFile.prototype.getValue = function (jsonPath) {
    if (!jsonPath)
        return this.json;
    var tokens = jsonPath.split('/');
    for (var cur = this.json, i = 0; cur && i < tokens.length; i++) {
        cur = cur[tokens[i]];
    }
    return cur;
};

JsonFile.prototype.setValue = function (jsonPath, value) {
    if (!jsonPath) {
        this.json = value;
        return this;
    }
    var tokens = jsonPath.split('/');
    var cur = this.json;
    for (var i = 0; i < tokens.length - 1; i++) {
        var token = tokens[i];
        cur = cur[token] = cur[token] || {};
    }
    cur[tokens[tokens.length - 1]] = value;
    return this;
};

JsonFile.prototype.remove = function (jsonPath) {
    if (!jsonPath)
        return this;
    var tokens = jsonPath.split('/');
    for (var cur = this.json, i = 0; cur && i < tokens.length - 1; i++) {
        cur = cur[tokens[i]];
    }
    if (cur)
        delete cur[tokens[tokens.length - 1]];
    return this;
};

JsonFile.prototype.load = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        fs.readFile(_this.path, 'utf8', function (err, data) {
            if (err)
                return reject(err);
            try {
                _this.json = JSON.parse(data);
                resolve(_this);
            } catch (err2) {
                reject(err2);
            }
        });
    });
};

JsonFile.prototype.save = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var data;
        try {
            data = JSON.stringify(_this.json, null, 2);
        } catch (err) {
            return reject(err);
        }

        fs.writeFile(_this.path, data, function (err) {
            if (err)
                reject(err);
            else
                resolve(_this);
        })
    });
};

module.exports = JsonFile;