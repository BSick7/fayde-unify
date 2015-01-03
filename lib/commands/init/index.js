var path = require('path');

function Init(renderer, unify) {
    this.renderer = renderer;
    this.unify = unify;
}
Init.prototype.interactive = function (args) {
    var name = this.unify.getValue("name")
        || path.basename(process.cwd());

    var _this = this;
    return this.renderer.prompt(getPrompts(name))
        .then(function (answers) {
            return _this.run({
                name: answers.name || name
            });
        });
};
Init.prototype.run = function (settings) {
    var _this = this;
    return this.unify
        .setValue('name', settings.name)
        .save()
        .then(function () {
            return _this;
        });
};

function getPrompts(name) {
    return [
        {
            type: 'input',
            name: 'name',
            message: 'name: (' + name + ')'
        }
    ];
}

module.exports = Init;