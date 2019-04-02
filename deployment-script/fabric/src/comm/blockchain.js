/**
* Copyright 2017 HUAWEI. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*
* @file, definition of the BlockChain class, which is used to interact with backend's blockchain system
*/

'use strict'

var path = require('path');
var Blockchain = class {
    constructor(configPath) {
        var args = require(configPath).blockchain;
        this.bcType = args.type;
        this.bcObj = null;
        if(this.bcType === 'fabric') {
            var fabric = require('../fabric/fabric.js');
            this.bcObj = new fabric(path.join(path.dirname(configPath), args.config));
        }
        else {
            throw new Error('Unknown blockchain type, ' + this.bcType);
        }
    }

    /**
    * return the blockchain type
    * @return {string}
    */
    gettype() {
        return this.bcType;
    }

    /**
    * prepare the underlying blockchain environment, e.g. join channel for fabric's peers
    * the function should be called only once for the same backend's blockchain system
    * even if multiple Blockchain objects are instantiated
    * @return {Promise}
    */
    init() {
        return this.bcObj.init();
    }

    /**
    * install smart contract on peers
    * the detailed smart contract's information should be defined in the configuration file
    * @return {Promise}
    */
    installSmartContract() {
        return this.bcObj.installSmartContract();
    }

    /**
    * get a system context that will be used to interact with backend's blockchain system
    * @name {string}, name of the context
    * @return {Promise.resolve(context)}
    */
    getContext(name) {
        return this.bcObj.getContext(name);
    }

    /**
    * release the system context
    * @return {Promise}
    */
    releaseContext(context) {
        return this.bcObj.releaseContext(context);
    }
}

module.exports = Blockchain;