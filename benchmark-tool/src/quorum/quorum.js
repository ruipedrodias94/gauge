/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
* @file Quorum Blockchain implementation
*/


'use strict';

const BlockchainInterface = require('../comm/blockchain-interface.js');
const deployContract = require('./deploy-contract.js');
const e2eUtils = require('./e2eUtils.js');
const parser = require('./parser.js');

/**
 *Quorum class of type blockchaintype
 *@param {string} config_path Path to quorum.json file
 */
class Quorum extends BlockchainInterface {
	/**
	 * @constructor
	 * @param {string} configPath Path to quorum.json file
	 */
	constructor(configPath) {
		super(configPath);
	}

	/**
	 * @return {string} type of blockchain
	 */
	gettype() {
		return 'quorum';
	}

	/**
	 * Intitalize configPath
	 * @return {null}
	 */
	init() {
		return e2eUtils.init(this.configPath);
	}

	/**
	 * Deploy contracts
	 * @return {Promise}
	 */
	installSmartContract() {
		return deployContract.run(this.configPath);
	}

	/**
	 * Get context for experiment
	 * @param {*} name name of the experiment
	 * @return {Promise} resolve has context inlcuding web3, contractInstance, target party
	 */
	getContext(name) {
		return e2eUtils.getcontext(name, this.configPath);
	}

	/**
	 * Release context
	 * @param {object} context
	 * @return {Promise.resolve}
	 */
	releaseContext(context) {
		return Promise.resolve();
	}

	/**
	 * NA
	 * @param {*} stats
	 * @param {*} results
	 */
	getDefaultTxStats(stats, results) { };

	/**
	 * Invoke smart contract function
	 * @param {*} context context fecthed by getContext function
	 * @param {*} contractID
	 * @param {*} contractVer
	 * @param {*} args
	 * @param {*} timeout
	 * @return {Promise} resolve with Transaction object
	 */
	invokeSmartContract(context, contractID, contractVer, args, timeout) {
		let simpleArgs = [];
		for (let i in args) {
			if (args[i]) {
				let arg = args[i];
				for (let key in arg) {
					if (arg[key]) {
						simpleArgs.push(arg[key]);
					}
				}
			}
		}
		return e2eUtils.invokebycontext(context, simpleArgs, timeout);
	}

	/**
	 * Query the smart contract state
	 * @param {*} context context fecthed by getContext function
	 * @param {*} contractID
	 * @param {*} contractVer
	 * @param {*} key
	 * @param {*} fname function name
	 * @return {Promise} resolve with Query object
	 */
	queryState(context, contractID, contractVer, key, fname) {
		return e2eUtils.querybycontext(context, contractID, contractVer, key, fname);
	}

	/**
	 * Resolve the results
	 * @param {*} bcContext
	 * @param {*} result
	 * @return {Promise}
	 */
	getResultConfirmation(bcContext, result) {
		if (result.length <= 0) {
			return Promise.reject(new Error('no transaction found in result array'));
		}
		return parser.getResultConfirmation(bcContext, result);
	}
}

module.exports = Quorum;
