#!/usr/bin/env node
'use strict';

process.bin = process.title = 'fayde';

var argv = require('optimist').argv,
    lib = require('../lib');

var config = {
    verbose: true
};

lib.interactive(argv, config, lib.unify("unify.json"));