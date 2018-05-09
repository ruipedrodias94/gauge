/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
* @file Entry point of the deployment script. 
*/


'use strict'

var path = require('path');
var config_path;
if(process.argv.length < 3) {
    config_path = path.join(__dirname, 'config.json');
}
else {
    config_path = path.join(__dirname, process.argv[2]);
}

var framework = require('../src/comm/bench-flow.js');
framework.run(config_path);

