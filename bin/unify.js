#!/usr/bin/env node
'use strict';

process.bin = process.title = 'unify';

var optimist = require('optimist'),
    faydeunify = require('../lib');

var argv = optimist.boolean(['v', 'verbose']).argv;

faydeunify.interactive(argv._[0], new faydeunify.JsonFile("unify.json"));