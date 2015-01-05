var path = require('path'),
    Promise = require('bluebird'),
    DEFAULT_CLIENT = 'fayde.json',
    DEFAULT_TYPE = 'app';

function Init(renderer, unify) {
    this.renderer = renderer;
    this.unify = unify;
}
Init.prototype.interactive = function (args) {
    var name = this.unify.getValue("name")
        || path.basename(process.cwd());

    var _this = this;
    return this.renderer.prompt(getPrompts1(name))
        .then(function (answers) {
            var settings = {
                name: answers.name || name,
                client: DEFAULT_CLIENT,
                type: answers.project_type,
                dist: answers.dist
            };
            if (settings.type === 'lib') {
                settings.library = {
                    type: answers.library_type,
                    exports: answers.exports || undefined
                };
            }
            return _this.run(settings);
        });
};
Init.prototype.run = function (settings) {
    var _this = this;
    this.unify
        .setValue('name', settings['name'])
        .setValue('client/files', [settings['client'] || DEFAULT_CLIENT])
        .setValue('type', settings['type'] || DEFAULT_TYPE);
    if (settings['dist'])
        this.unify.setValue('dist', settings['dist']);
    if (settings['library'])
        this.unify.setValue('library', settings['library']);
    return this.unify
        .save()
        .then(function () {
            return _this;
        });
};

function getPrompts1(name) {
    return [
        {
            type: 'input',
            name: 'name',
            message: 'Name',
            default: name
        },
        {
            type: 'list',
            name: 'project_type',
            message: 'Project Type',
            choices: [
                {name: 'Application', value: 'app'},
                {name: 'Library', value: 'lib'}
            ]
        },
        {
            type: 'input',
            name: 'dist',
            message: 'Distributable',
            default: function (response) {
                return 'dist/' + response.name + '.js'
            },
            when: function (response) {
                return response.project_type === 'lib';
            }
        },
        {
            type: 'list',
            name: 'library_type',
            message: 'Library Type',
            choices: [
                {name: 'CommonJS', value: 'commonjs'},
                {name: 'AMD', value: 'amd'},
                {name: 'Export', value: 'export'}
            ],
            when: function (response) {
                return response.project_type === 'lib';
            }
        },
        {
            type: 'exports',
            name: 'exports',
            message: 'Export Variable?',
            default: function (response) {
                return response.name;
            },
            when: function (response) {
                return response.library_type === 'export';
            }
        }
    ];
}

module.exports = Init;