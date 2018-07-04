/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
* @file, definition of the Fabric class, which implements the caliper's NBI for hyperledger fabric
*/

'use strict'

var PayloadGeneratorInterface = require('../comm/payload-generator-interface.js')
class RandomPayloadGenerator extends PayloadGeneratorInterface {
    
    constructor(args) {
        super(args);
        this.args = args
        
    }


    generate(counter) {
      
        var result = []
        for (var i = 0; i < counter; i++)
        {
            var temp_args = []
            temp_args.push(this.args[0].args[0])
            var argumentObject = {}
            argumentObject.chaincodeid = this.args[0].chaincodeid
            for (var j = 1; j < this.args[0].args.length; j++)
            {
                var payloadDataKey = Object.keys(this.args[0].args[j])[0]
                var payloadData = this.args[0].args[j][payloadDataKey] + Math.floor((Math.random() * counter) + 1)
                var payload = {}
                payload[payloadDataKey + Math.floor((Math.random() * counter) + 1)] = payloadData
                temp_args.push(payload)
              
            }
        argumentObject.args = temp_args
        result.push(argumentObject)
    }
     return result
    }

} 
module.exports = RandomPayloadGenerator;

