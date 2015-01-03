#!/usr/bin/env node
'use strict';

process.bin = process.title = 'fayde';

var argv = require('optimist').argv,
    lib = require('../lib');

var config = {
    verbose: !!argv.verbose || !!argv.v
};

lib.interactive(argv, config, lib.unify("unify.json"));