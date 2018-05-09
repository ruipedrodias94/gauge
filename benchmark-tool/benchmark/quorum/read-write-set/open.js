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
let setLength;
let bc;
let contx;
module.exports.init = (blockchain, context, args) =>{
    if (!args.hasOwnProperty('setLength')) {
        return Promise.reject(new Error('simple.open - setLength is missed in the arguments'));
    }

    setLength = args['setLength'];
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};

module.exports.run = () =>{
    let newAcc = 'accounts_' + accounts.length;
    accounts.push(newAcc);
    return bc.invokeSmartContract(contx, 'simple', 'v0', [{verb: 'open'}, {account: newAcc}, {setLength: setLength}]);
};

module.exports.end = (results) =>{
    return Promise.resolve(accounts);
};
