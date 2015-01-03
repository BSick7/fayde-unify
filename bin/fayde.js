#!/usr/bin/env node
'use strict';

process.bin = process.title = 'fayde';

var optimist = require('optimist'),
    faydeunify = require('../lib');

var argv = optimist.boolean(['v', 'verbose']).argv;
var config = {
    verbose: argv.v || argv.verbose
};

faydeunify.interactive(argv._[0], config, faydeunify.unify("unify.json"));