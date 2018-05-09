/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
* @file Implementation of the user test module for Write-only workload
*/

'use strict'

module.exports.info  = "opening accounts";

var bc, contx;
var init = 0;
var config_arguments;
var key;
module.exports.init = function(blockchain, context, args) {
    
    config_arguments = args;
    key = config_arguments[0]["args"][1]["key"]
    bc = blockchain;
    contx = context;
    return Promise.resolve();
}

module.exports.run = function() {
    
    var args = [];
    var newKey = key + init;
    init++;
    config_arguments[0]["args"][1]["key"] = newKey
    return bc.invokeSmartContract(contx, config_arguments[0]["chaincodeid"], 'v0', config_arguments[0]["args"], 120);
}

module.exports.end = function(results) {
    return Promise.resolve();
}
