/**
* Copyright 2017 HUAWEI. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*
* @file, definition of the Fabric class, which implements the caliper's NBI for hyperledger fabric
*/


'use strict'

var util = require('./util.js');
var e2eUtils = require('./e2eUtils.js');
var impl_create = require('./create-channel.js');
var impl_join = require('./join-channel.js');
var impl_install = require('./install-chaincode.js');
var impl_instantiate = require('./instantiate-chaincode.js');
var BlockchainInterface = require('../comm/blockchain-interface.js')
var utils = require('fabric-client/lib/utils.js');
var logger = utils.getLogger('E2E testing');

class Fabric extends BlockchainInterface {
    constructor(config_path) {
        super(config_path);
    }

    init() {
        util.init(this.configPath);
        e2eUtils.init(this.configPath);

     return impl_create.run(this.configPath).then(() => {
            return impl_join.run(this.configPath)
       })
            .catch((err) => {
                logger.error('fabric.init() failed, ' + (err.stack ? err.stack : err));
                return Promise.reject(err);
            });
    }

    installSmartContract() {
        // todo: now all chaincodes are installed and instantiated in all peers, should extend this later
        return impl_install.run(this.configPath).then(() => {
            return impl_instantiate.run(this.configPath)
        })
            .catch((err) => {
                logger.error('fabric.installSmartContract() failed, ' + (err.stack ? err.stack : err));
                return Promise.reject(err);
            });
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
            channel = util.getChannel(context[name]);
        }

        if (!channel) {
            return Promise.reject(new Error("could not find context's information in config file"));
        }

        return e2eUtils.getcontext(channel);

    }

    releaseContext(context) {
        return e2eUtils.releasecontext(context).then(() => {
            return sleep(1000);
        });
    }
}
module.exports = Fabric;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}