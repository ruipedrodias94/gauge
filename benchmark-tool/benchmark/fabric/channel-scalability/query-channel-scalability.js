/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
* @file Implementation of the user test module for Channel scalability read-only workload
*/

'use strict'

module.exports.info  = "querying accounts";


var bc, contx;
var config_arguments;


module.exports.init = function(blockchain, context, args) {

    bc       = blockchain;
    contx    = context;
	config_arguments = args
    return Promise.resolve();
}

module.exports.run = function(iteration) {
	

    return bc.queryState(contx, config_arguments[iteration-1]["chaincodeid"], 'v0', config_arguments[iteration-1]["args"],config_arguments[iteration-1]["channelid"]);
}

module.exports.end = function(results) {
 
    return Promise.resolve();
}
