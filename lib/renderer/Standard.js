var chalk = require('chalk'),
    inquirer = require('inquirer'),
    Promise = require('bluebird');

function StandardRenderer(config) {
    this.$$colors = {
        warn: chalk.yellow,
        error: chalk.red,
        debug: chalk.grey,
        default: chalk.cyan
    };
    this.$$config = config;

    process.stdout.on('error', exitOnPipeError);
    process.stderr.on('error', exitOnPipeError);
}

StandardRenderer.prototype.debug = function (message, nonew) {
    if (this.$$config && this.$$config.verbose) {
        writeOut(message, nonew);
    }
};

StandardRenderer.prototype.warn = function (message) {
    process.stdout.write(this.$$colors.warn(message));
};

StandardRenderer.prototype.error = function (err) {
    process.stderr.write(this.$$colors.error(err.message));
};

StandardRenderer.prototype.log = function (message) {
    process.stdout.write(message);
};

StandardRenderer.prototype.prompt = function (prompts) {
    return new Promise(function (resolve, reject) {
        inquirer.prompt(prompts, resolve);
    });
};

function writeOut(message, nonew) {
    if (nonew)
        process.stdout.write(message);
    else
        process.stdout.write(message + '\n');
}

function exitOnPipeError(err) {
    if (err.code === 'EPIPE') {
        process.exit(0);
    }
}

module.exports = StandardRenderer;