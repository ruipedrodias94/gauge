/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
* @file Implementation of the user test module for Channel scalability write-only workload
*/

'use strict'

module.exports.info  = "opening accounts";


var bc, contx;
var config_arguments;

module.exports.init = function(blockchain, context, args) {


    config_arguments = args
    bc = blockchain;
    contx = context;
    return Promise.resolve();
}

module.exports.run = function(iteration) {
    
    return bc.invokeSmartContract(contx,  config_arguments[iteration-1]["chaincodeid"], 'v0', config_arguments[iteration-1]["args"], 120,config_arguments[iteration-1]["channelid"]);
}

module.exports.end = function(results) {
    return Promise.resolve();
}
