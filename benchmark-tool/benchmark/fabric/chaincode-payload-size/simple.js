/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
* @file Entry point of the Benchmarking script. 
*/

'use strict'

var path = require('path');
var childProcess = require('child_process');
var fs = require('fs')  
const logger = require('../../../src/comm/util');

var config_path;
config_path = path.join(__dirname, process.argv[2]);
let blockListenerPath = path.join(__dirname, '../../../listener/block-listener-handler.js');
let kafka_child = childProcess.fork(blockListenerPath);

kafka_child.on('error', function () {
    logger.error('client encountered unexpected error');
});

kafka_child.on('exit', function () {
    logger.info('client exited');
});

kafka_child.send({ msg: config_path });

// use default framework to run the tests
var framework = require('../../../src/comm/bench-flow.js');
framework.run(config_path, kafka_child);
