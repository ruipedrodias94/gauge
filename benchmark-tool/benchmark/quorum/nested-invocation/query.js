/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*/

'use strict';

let bc;
let contx;
let accounts;

module.exports.info = 'querying accounts';

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
    let randomNumber = Math.floor(Math.random() * (accounts.length - 0 + 1) + 0);
    let newAcc = 'accounts_' + randomNumber;
    return bc.queryState(contx, 'simple', 'v0', newAcc, 'query');
};

module.exports.end = (results) => {
    return Promise.resolve();
};
