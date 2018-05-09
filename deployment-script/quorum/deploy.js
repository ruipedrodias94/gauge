/*
 * Created on Wed Mar 28 2018
 *
 * Copyright 2018 Persistent systems limited.
 *
 *Licensed under the Apache License, Version 2.0 (the 'License');
 *you may not use this file except in compliance with the License.
 *You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *Unless required by applicable law or agreed to in writing, software
 *distributed under the License is distributed on an 'AS IS' BASIS,
 *WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *See the License for the specific language governing permissions and
 *limitations under the License.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const Web3 = require('web3');
const solc = require('solc');
const log4js = require('log4js');
const logger = log4js.getLogger('Benchmark');
logger.level = process.env.NODE_ENV === "production" ? 'error' : 'trace';

let configPath;
if (!process.argv[2]) {
	logger.warn('Quorum config path argument is missing: considering the default "quorum.json" file');
	configPath = path.join(__dirname,'quorum.json');
} else {
	configPath = path.join(__dirname, process.argv[2]);
}
let quorumConfig = require(configPath);
const contracts = quorumConfig.quorum.contracts;
if (typeof contracts === 'undefined' || contracts.length === 0) {
	logegr.error('No Contracts found to deploy');
	process.exit(1);
}

const nodeToConnect = process.env.CURRENT_NODE ? process.env.CURRENT_NODE : 'development';
const nodeUrl = quorumConfig.quorum.network[nodeToConnect].httpProvider.url;
const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

// Deploy each contract and update quorum.json config file with new contract addresses.
contracts.map((contract, index) => {
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
			}
		}
	});
});
