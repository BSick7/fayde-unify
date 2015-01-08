var chalk = require('chalk'),
    inquirer = require('inquirer'),
    Promise = require('bluebird');

function StandardLogger(config) {
    this.$$colors = {
        warn: chalk.yellow,
        error: chalk.red,
        debug: chalk.grey,
        default: chalk.cyan,
        auto: chalk.blue
    };
    this.$$config = config;

    process.stdout.on('error', exitOnPipeError);
    process.stderr.on('error', exitOnPipeError);
}

StandardLogger.prototype.debug = function (message, nonew) {
    if (this.$$config && this.$$config.verbose) {
        writeOut(message, nonew);
    }
};

StandardLogger.prototype.warn = function (message) {
    writeOut(this.$$colors.warn(message));
};

StandardLogger.prototype.error = function (err) {
    var msg = '';
    if (typeof err === "string")
        msg = err;
    if (err.message)
        msg += err.message + '\n';
    if (err.stack)
        msg += err.stack + '\n';

    process.stderr.write(this.$$colors.error(msg || err.toString()));
};

StandardLogger.prototype.log = function (message) {
    writeOut(message);
};

StandardLogger.prototype.auto = function (message) {
    writeOut(this.$$colors.auto(message));
};

StandardLogger.prototype.prompt = function (prompts) {
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

module.exports = StandardLogger;