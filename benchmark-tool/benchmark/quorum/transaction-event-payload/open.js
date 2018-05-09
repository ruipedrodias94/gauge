/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*/

'use strict';

module.exports.info = 'opening accounts';

let accounts = [];
let payloadSize;
let bc;
let contx;

module.exports.init = (blockchain, context, args) => {
    if (!args.hasOwnProperty('payloadSize')) {
        return Promise.reject(new Error('simple.open - payloadSize is missed in the arguments'));
    }
    payloadSize = args['payloadSize'];
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};

module.exports.run = () => {
    let buf = Buffer.alloc(payloadSize, 'a');
    buf = buf.toString('utf8');
    return bc.invokeSmartContract(contx, 'simple', 'v0', [{verb: 'open'}, {account: buf}, {payloadSize: payloadSize}]);
};

module.exports.end = (results) => {
    return Promise.resolve(accounts);
};
