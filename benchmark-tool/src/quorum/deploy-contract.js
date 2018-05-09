/**
 * Original work
 * Modifications Copyright 2017 HUAWEI
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Modified work Copyright Persistent Systems 2018. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

'use strict';

const tape = require('tape');
const _test = require('tape-promise');
const test = _test(tape);
const e2eUtils = require('./e2eUtils.js');

module.exports.run = (configPath) => {
    let quoromSettings = require(configPath);
    const contracts = quoromSettings.quorum.contracts;

    if (typeof contracts === 'undefined' || contracts.length === 0) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        test('\n\n***** deploy contract *****\n\n', (t) => {
            contracts.reduce((prev, contract, index) => {
                return prev.then(() => {
                    return e2eUtils.deployContract(contract, index, configPath).then(() => {
                        t.pass('Deploy contract successfully ');
                        t.comment('Sleep 5s...');
                        return sleep(5000);
                    });
                });
            }, Promise.resolve())
                .then(() => {
                    t.end();
                    return resolve();
                })
                .catch((err) => {
                    t.pass('Failed to Deploy smart contract, ' + (err.stack ? err.stack : err));
                    t.end();
                    return reject(new Error('Quorum: Contract Deployment failed'));
                });
        });
    });
};

let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
