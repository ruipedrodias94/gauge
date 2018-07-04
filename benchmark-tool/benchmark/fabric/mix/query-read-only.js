/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
* @file Implementation of use test module for Read-only.
*/

'use strict'
var RandomPayloadGenerator = require('../../../src/fabric/RandomPayloadGenerator.js')
var SequentialPayloadGenerator = require('../../../src/fabric/SequentialPayloadGenerator.js')
module.exports.info  = "opening accounts";

var bc, contx;
var init = 0;
var config_arguments;
var key;
var payload;

module.exports.init = function(blockchain, context, args, counter) {

    // If args lenght is > 1, then its assumed that there are no static paylaods. 
    // else read the payload and pass to each txn.
    if (args.length == 1){
        var generator = new RandomPayloadGenerator(args)
        payload = generator.generate(counter)
    }

    else {
        payload = args
    }
    
    bc = blockchain;
    contx = context;
    return Promise.resolve();
}

module.exports.run = function() {

    init++;
    console.log(payload[init-1]["args"])
    return bc.queryState(contx, payload[init-1]["chaincodeid"], 'v0', payload[init-1]["args"], 120);
}

module.exports.end = function(results) {
    return Promise.resolve();
}
