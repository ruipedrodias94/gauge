/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*/

'use strict';

module.exports.info = 'querying accounts';

let bc;
let contx;
let accounts;
let popacc = [];

module.exports.init = (blockchain, context, args) => {
    if (!args.hasOwnProperty('accounts') || args['accounts'].length === 0) {
        return Promise.reject(new Error('simple.query - accounts is missed in the arguments'));
    }
    bc = blockchain;
    contx = context;
    accounts = args.accounts;
    return Promise.resolve();
};

module.exports.run = () => {
    let acc = accounts[Math.floor(Math.random() * (accounts.length))];
    // index++;
    popacc.push(acc);
    return bc.queryState(contx, 'simple', 'v0', acc, 'query');
};

module.exports.end = (results) => Promise.resolve();
