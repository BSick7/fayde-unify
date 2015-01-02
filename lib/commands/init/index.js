var path = require('path');

function Init(renderer, config) {
    this.renderer = renderer;
    this.config = config;
}
Init.prototype.interactive = function (args, unify) {
    var name = this.config.name
        || path.basename(process.cwd());

    var _this = this;
    return this.renderer.prompt(getPrompts(name))
        .then(function (answers) {
            return _this.run({
                name: answers.name || name
            }, unify);
        });
};
Init.prototype.run = function (settings, unify) {
    this.renderer.log("Initializing " + settings.name);
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