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
let key;

module.exports.info = 'querying accounts';

module.exports.init = (blockchain, context, args) => {
    if (!args.hasOwnProperty('key') || args['key'].length === 0) {
        return Promise.reject(new Error('simple.query - key is missed in the arguments'));
    }
    bc = blockchain;
    contx = context;
    key = args.key.length;

    return Promise.resolve();
};

module.exports.run = () => {
    return bc.queryState(contx, 'simple', 'v0', key, 'query');
};

module.exports.end = (results) => {
    return Promise.resolve();
};
