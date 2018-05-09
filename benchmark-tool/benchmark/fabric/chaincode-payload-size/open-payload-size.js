/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
* @file Implementation of use test module for Chaincode-Payload.
*/

'use strict'

module.exports.info  = "opening accounts";

var bc, contx;
var config_arguments;

module.exports.init = function(blockchain, context, args) {
    
    config_arguments = args;
    bc = blockchain;
    contx = context;
    return Promise.resolve();
}

module.exports.run = function() {
    
    var payloadSize = config_arguments[0]["args"][2]["payloadSize"] 
    var valueHex = new Buffer.alloc(parseInt(payloadSize) ,'a' )
    valueHex = valueHex.toString('utf8')
    config_arguments[0]["args"][2]["payloadSize"] = valueHex
    return bc.invokeSmartContract(contx, config_arguments[0]["chaincodeid"], 'v0', config_arguments[0]["args"], 120);
}

module.exports.end = function(results) {
    return Promise.resolve();
}
