/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
* @file Implementation of the deployment script to Create channel, Join channel, Install chaincode, instantiate chaincode
*/

'use strict'


var Blockchain = require('../../src/comm/blockchain.js');
var blockchain;

module.exports.run = function (config_path) {
    var startTime = process.uptime();
    blockchain = new Blockchain(config_path);

    var startPromise = new Promise((resolve, reject) => {
        let config = require(config_path);
        if (config.hasOwnProperty('command') && config.command.hasOwnProperty('start')) {
         
            let child = exec(config.command.start, (err, stdout, stderr) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
            child.stdout.pipe(process.stdout);
            child.stderr.pipe(process.stderr);
        }
        else {
            resolve();
        }
    });

    startPromise.then(() => {

        return blockchain.init();

    }, (err) => {
        console.log("Error: ", err)
    })
        .then(() => {

            return blockchain.installSmartContract();

        })
        .then(() => {

            console.log("Sucessfully created the channel, joined peers to channel and instantiated the chaincode");
            var endtime = process.uptime();
            var timeTaken = endtime - startTime;
            console.log("\nTime taken to run the script:", timeTaken)
            process.exit()

        })
        .catch((err) => {
            console.log('unexpected error, ' + (err.stack ? err.stack : err));
        });
}
