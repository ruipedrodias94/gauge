/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*
* @file Entry point of the Benchmarking script.
*/

'use strict';

const path = require('path');
const childProcess = require('child_process');
const fs = require('fs');
const logger = require('../../../src/comm/util');

let configPath;
if (process.argv.length < 3) {
    configPath = path.join(__dirname, 'config.json');
} else {
    configPath = path.join(__dirname, process.argv[2]);
}
let blockListenerPath = path.join(__dirname, '../../../listener/block-listener-handler.js');
let kafkaChild = childProcess.fork(blockListenerPath);

kafkaChild.on('error', () => {
    logger.error('client encountered unexpected error');
});

kafkaChild.on('exit', () => {
    logger.info('client exited');
});
kafkaChild.send({msg: configPath});

// use default framework to run the tests
const framework = require('../../../src/comm/bench-flow.js');

if (fs.existsSync('offset.txt')) {
    fs.unlink('offset.txt', (error) => {
        if (error) {
            logger.error('Error deleting');
        } else {
            logger.info('Deleted offset.txt!!');
            framework.run(configPath, kafkaChild);
        }
    });
} else {
    framework.run(configPath, kafkaChild);
}
