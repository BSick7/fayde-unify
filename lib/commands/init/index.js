var path = require('path'),
    Promise = require('bluebird'),
    logger = require('../../logger')(),
    DEFAULT_TESTS = 'fayde.json',
    DEFAULT_TYPE = 'app';

function Init(unify) {
    this.unify = unify;
}
Init.prototype.interactive = function (args) {
    var name = this.unify.getValue("name")
        || path.basename(process.cwd());

    var _this = this;
    return logger.prompt(getPrompts1(name))
        .then(function (answers) {
            var settings = {
                name: answers.name || name,
                type: answers.project_type,
                dist: answers.dist
            };
            if (settings.type === 'lib') {
                settings.library = {
                    type: answers.library_type,
                    exports: answers.exports || undefined
                };
            }
            if (answers.includets === true) {
                var dist = settings.dist;
                if (dist.substr(dist.length - 3) === '.js')
                    dist = dist.substr(0, dist.length - 3);
                settings.typings = [dist + '.d.ts'];
            }
            return _this.run(settings);
        });
};
Init.prototype.run = function (settings) {
    var tests = settings.tests || DEFAULT_TESTS;
    if (!Array.isArray(tests))
        tests = [tests];
    var typings = settings.typings;
    if (typings && !Array.isArray(typings))
        typings = [typings];

    return Promise.resolve(this)
        .tap(function (_this) {
            return _this.unify
                .setValue('name', settings.name)
                .setValue('client/tests', tests)
                .setValue('type', settings.type || DEFAULT_TYPE)
                .setValue('dist', settings.dist || undefined)
                .setValue('library', settings.library || undefined)
                .setValue('typings', typings)
                .save();
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
            type: 'input',
            name: 'exports',
            message: 'Export Variable?',
            default: function (response) {
                return response.name;
            },
            when: function (response) {
                return response.library_type === 'export';
            }
        },
        {
            type: 'confirm',
            name: 'includets',
            message: 'Include Typescript typings?',
            default: true,
            when: function (response) {
                return response.project_type === 'lib';
            }
        }
    ];
}

module.exports = Init;