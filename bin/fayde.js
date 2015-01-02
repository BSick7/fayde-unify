#!/usr/bin/env node
'use strict';

process.bin = process.title = 'fayde';

var argv = require('optimist').argv,
    lib = require('../lib');

var config = {
    verbose: true
};

//TODO: Replace with unify object
var unify = {

};

lib.interactive(argv, config, unify);