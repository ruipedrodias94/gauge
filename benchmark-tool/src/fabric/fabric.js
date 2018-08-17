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

var util = require('./util.js');
var BlockchainInterface = require('../comm/blockchain-interface.js')
var e2eUtils;

class Fabric extends BlockchainInterface {
    constructor(config_path, exptType) {

        // for channel scalability
        if (require(exptType).test.type == "MULTI_CHANNEL") {
           
            e2eUtils = require('./e2eUtils-channel-scalability.js');        

        }
        // for non channel scalability
        else {

            e2eUtils = require('./e2eUtils.js');

        }
        super(config_path);
    }

    init() {
        util.init(this.configPath);
         e2eUtils.init(this.configPath);
    
        return new Promise(function (resolve, reject) {
            return resolve();
       })

    }

    installSmartContract() {
        // todo: now all chaincodes are installed and instantiated in all peers, should extend this later
    }

    getContext(name) {
        util.init(this.configPath);
        e2eUtils.init(this.configPath);

        var config = require(this.configPath);
        var context = config.fabric.context;
        var channel;
        if (typeof context === 'undefined') {
            channel = util.getDefaultChannel();
        }
        else {
            channel = util.getChannel(context[name][0]);
        }

        if (!channel) {
            return Promise.reject(new Error("could not find context's information in config file"));
        }

        return e2eUtils.getcontext(channel);

    }

    getResultConfirmation(bcContext, result) {

        if (result.length <= 0) {
            return Promise.reject(new Error("No transactions found in the result array"));
        }

        return e2eUtils.getResultConfirmation(bcContext, result);
    }

    releaseContext(context) {
        return e2eUtils.releasecontext(context).then(() => {
            return sleep(1000);
        });
    }

    invokeSmartContract(context, contractID, contractVer, args, timeout, channelId) {
        var simpleArgs = [];
        for (let i in args) {
            let arg = args[i];
            for (let key in arg) {
                simpleArgs.push(arg[key]);
            }
        }
        return e2eUtils.invokebycontext(context, contractID, contractVer, simpleArgs, timeout, channelId);
    }

    queryState(context, contractID, contractVer, args, channelId) {
        var simpleArgs = [];
        for (let i in args) {
            let arg = args[i];
            for (let key in arg) {
                simpleArgs.push(arg[key]);
            }
        }
        return e2eUtils.querybycontext(context, contractID, contractVer, simpleArgs, channelId);
    }

    getDefaultTxStats(stats, results) {
        var minDelayC2E = 100000, maxDelayC2E = 0, sumDelayC2E = 0; // time from created to endorsed
        var minDelayE2O = 100000, maxDelayE2O = 0, sumDelayE2O = 0; // time from endorsed to ordered
        var minDelayO2V = 100000, maxDelayO2V = 0, sumDelayO2V = 0; // time from ordered to recorded
        var hasValue = true;
        for (let i = 0; i < results.length; i++) {
            let stat = results[i];
            if (!stat.hasOwnProperty('time_endorse')) {
                hasValue = false;
                break;
            }
            if (stat.status === 'success') {
                let delayC2E = stat['time_endorse'] - stat['time_create'];
                let delayE2O = stat['time_order'] - stat['time_endorse'];
                let delayO2V = stat['time_valid'] - stat['time_order'];

                if (delayC2E < minDelayC2E) {
                    minDelayC2E = delayC2E;
                }
                if (delayC2E > maxDelayC2E) {
                    maxDelayC2E = delayC2E;
                }
                sumDelayC2E += delayC2E;

                if (delayE2O < minDelayE2O) {
                    minDelayE2O = delayE2O;
                }
                if (delayE2O > maxDelayE2O) {
                    maxDelayE2O = delayE2O;
                }
                sumDelayE2O += delayE2O;

                if (delayO2V < minDelayO2V) {
                    minDelayO2V = delayO2V;
                }
                if (delayO2V > maxDelayO2V) {
                    maxDelayO2V = delayO2V;
                }
                sumDelayO2V += delayO2V;
            }
        }

        if (hasValue) {
            stats['delayC2E'] = { 'min': minDelayC2E, 'max': maxDelayC2E, 'sum': sumDelayC2E };
            stats['delayE2O'] = { 'min': minDelayE2O, 'max': maxDelayE2O, 'sum': sumDelayE2O };
            stats['delayO2V'] = { 'min': minDelayO2V, 'max': maxDelayO2V, 'sum': sumDelayO2V };
        }
    }
}
module.exports = Fabric;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
