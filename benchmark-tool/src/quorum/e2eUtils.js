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

const path = require('path');
const fs = require('fs');
const process = require('process');
const Web3 = require('web3');
const solc = require('solc');
const logger = require('../comm/util');

let init = (configPath) => Promise.resolve();

let deployContract = (contract, index, configPath) => {
	return new Promise((resolve, reject) => {
		let quorumConfig = require(configPath);
		const nodeToConnect = process.env.CURRENT_NODE ? process.env.CURRENT_NODE : 'development';
		const nodeUrl = quorumConfig.quorum.network[nodeToConnect].httpProvider.url;
		const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
		// compute the abi, bytecode using solc.
		const input = fs.readFileSync(path.join(path.dirname(__dirname), contract.path)); // Read contract source code.
		const output = solc.compile(input.toString(), 1); // convert buffer to string and compile
		const bytecode = '0x' + output.contracts[':' + contract.name].bytecode;
		const abi = JSON.parse(output.contracts[':' + contract.name].interface); // parse ABI
		const contractInstance = web3.eth.contract(abi);
		contractInstance.new([], {
			from: web3.eth.accounts[0],
			data: bytecode,
			gas: 0x47b760, // Minimum gas to deploy contracts
			privateFor: (process.env.PRIVATE ? contract.privateFor : undefined)
		}, (err, contract) => {
			if (err) {
				logger.error('err creating contract', err);
				reject(err);
			} else {
				if (!contract.address) {
					logger.info('Contract transaction send: TransactionHash: ' + contract.transactionHash + ' waiting to be mined...');
				} else {
					logger.info('Contract mined! Address: ' + contract.address);
					// Update quorum.json file with new Address, ABI and bytecode
					quorumConfig.quorum.contracts[index].address = contract.address;
					quorumConfig.quorum.contracts[index].abi = abi;
					quorumConfig.quorum.contracts[index].bytecode = bytecode;
					const string = JSON.stringify(quorumConfig, null, '\t');
					fs.writeFileSync(configPath, string);
					resolve();
				}
			}
		}
		);
	});
};

let getcontext = (name, configPath) => {
	return new Promise((resolve, reject) => {
		let quorumConfig = require(configPath);
		const nodeToConnect = process.env.CURRENT_NODE ? process.env.CURRENT_NODE : 'development';
		const nodeUrl = quorumConfig.quorum.network[nodeToConnect].httpProvider.url;
		logger.info( 'Selected Node: ' + nodeUrl);
		let contract;
		const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
		switch (name) {
			case 'ioheavy':
				contract = getContract('ioheavy', quorumConfig);
				break;
			case 'query':
				contract = getContract('simple', quorumConfig);
				break;
			case 'open':
				contract = getContract('simple', quorumConfig);
				break;
			default:
				contract = getContract(name, quorumConfig);
				break;
		}

		(contract == undefined) // Unknown contract
			? reject({contractInstance: null})
			: resolve({
				contractInstance: web3.eth.contract(contract.abi).at(contract.address),
				targetParty: quorumConfig.quorum.network[nodeToConnect].targetParty,
				web3: web3,
				from: web3.eth.accounts[0],
				type: name,
			});
	});
};

let getContract = (contractName, quorumConfig) => {
	const contractList = quorumConfig.quorum.contracts;
	return contractList.filter((contract) => {
		return contract.experimentName == contractName;
	})[0]; // return first element found matching experimentName from quorum.json
};

let releasecontext = (context) => Promise.resolve();

let sendTransaction = (contractInstance, functionName, from, args, type, targetParty) => {
	return new Promise((resolve, reject) => {
		logger.info( functionName, args);
		switch (type) {
			case 'null':
				contractInstance[functionName]({
					from: from,
					privateFor: (process.env.PRIVATE ? targetParty : undefined)
				}, (err, txID) => txID ? resolve(txID) : reject(err));
				break;
			case 'readWriteSet':
				contractInstance[functionName](args[1], {
					from: from,
					gas: 0xE0000000,
					privateFor: (process.env.PRIVATE ? targetParty : undefined)
				}, (err, txID) => txID ? resolve(txID) : reject(err));
				break;
			case 'transactionEventPayload':
				contractInstance[functionName](args[0], {
					from: from,
					gas: 0xE000000,
					privateFor: (process.env.PRIVATE ? targetParty : undefined)
				}, (err, txID) => txID ? resolve(txID) : reject(err));
				break;
			case 'keyValStore':
				contractInstance[functionName](args[1], args[1], {
					from: from,
					privateFor: (process.env.PRIVATE ? targetParty : undefined)
				}, (err, txID) => txID ? resolve(txID) : reject(err));
				break;
			default:
				contractInstance[functionName](args[0], args[1], {
					from: from,
					gas: 0xE000000,
					privateFor: (process.env.PRIVATE ? targetParty : undefined)
				}, (err, txID) => txID ? resolve(txID) : reject(err));
				break;
		}
	});
};

let invokebycontext = (context, args, timeout) => {
	return new Promise((resolve, reject) => {
		const contractInstance = context.contractInstance;
		const targetParty = context.targetParty;
		const from = context.from;
		const type = context.type;
		let invokeStatus = {
			id: null,
			status: 'created',
			time_create: new Date().getTime() / 1000,
			time_valid: 0,
			result: null,
		};
		const functionName = args[0];
		args.shift();
		sendTransaction(contractInstance, functionName, from, args, type, targetParty).then((txID) => {
			invokeStatus.id = txID;
			resolve(invokeStatus);
		}).catch((err) => {
			logger.error(err);
			invokeStatus.time_valid = new Date().getTime() / 1000;
			invokeStatus.status = 'failed';
			resolve(invokeStatus);
		});
	});
};

let querybycontext = (context, id, version, name, fname) => {
	return new Promise((resolve, reject) => {
		const contractInstance = context.contractInstance;
		let invokeStatus = {
			id: null,
			status: 'created',
			time_create: new Date().getTime() / 1000,
			time_valid: 0,
			result: null,
		};
		contractInstance[fname].call(name, (err, result) => {
			if (!err) {
				invokeStatus.time_valid = new Date().getTime() / 1000;
				invokeStatus.result = result;
				invokeStatus.status = 'success';
				logger.info( 'Key: ' + name + ' result: ' + result);
				resolve(invokeStatus);
			} else {
				invokeStatus.time_valid = new Date().getTime() / 1000;
				invokeStatus.status = 'failed';
				logger.error('Query failed, ' + (err.stack ? err.stack : err));
				resolve(invokeStatus);
			}
		});
	});
};

let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
	init,
	deployContract,
	getcontext,
	getContract,
	releasecontext,
	invokebycontext,
	querybycontext,
	sleep,
};
