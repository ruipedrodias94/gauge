/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
* @file Implementation of the chaincode instantiation. 
*/


'use strict'

var path = require('path');
var util = require('../src/fabric/util.js');
var e2eUtils = require('../src/fabric/e2eUtils.js');
var impl_instantiate = require('../src/fabric/instantiate-chaincode.js');
const log4js = require('log4js');
const logger = log4js.getLogger('Benchmark');
logger.level = process.env.NODE_ENV === "production" ? 'error' : 'trace';

var config_path = path.join(__dirname, 'fabric.json');

function init() {
    util.init(config_path);
    e2eUtils.init(config_path);
    return Promise.resolve();
}

function installSmartContract() {

    impl_instantiate.run(config_path).then((response) => { })
        .catch((err) => {
            logger.info('fabric.installSmartContract() failed, ' + (err.stack ? err.stack : err));
            return Promise.reject(err);
        });
}

init().then(() => {

    installSmartContract();
})
