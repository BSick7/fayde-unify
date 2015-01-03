#!/usr/bin/env node
'use strict';

process.bin = process.title = 'fayde';

var argv = require('optimist').argv,
    faydeunify = require('../index.js');

var config = {
    verbose: !!argv.verbose || !!argv.v
};

faydeunify.interactive(argv, config, faydeunify.unify("unify.json"));