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

var utils = require('fabric-client/lib/utils.js');
var logger = utils.getLogger('E2E testing');
const os = require('os');
var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
var index = 0;
var path = require('path');
var fs = require('fs');
var util = require('util');
var process = require('process');
var Client = require('fabric-client');
var testUtil = require('./util.js');
var kafka_config = require("../../listener/kafka-config.json")
var ORGS;
var rootPath = '../../../'
var tx_id = null;
var the_user = null;
var targets = [];
var evhub = require('./eventHub.js');
var fabricVersion ;

function init(config_path) {
	Client.addConfigFile(config_path);
	ORGS = Client.getConfigSetting('fabric').network;
	fabricVersion = Client.getConfigSetting('fabric').fabricVersion;
}
module.exports.init = init;

function buildChaincodeProposal(client, the_user, chaincode, upgrade, transientMap, endorsement_policy) {
	var tx_id = client.newTransactionID();

	// send proposal to endorser
	var request = {
		chaincodePath: chaincode.path,
		chaincodeId: chaincode.id,
		chaincodeVersion: chaincode.version,
		fcn: 'init',
		args: chaincode.args,       // TODO: should defined in config file
		txId: tx_id,
		'endorsement-policy': endorsement_policy
	};


	if (upgrade) {
		// use this call to test the transient map support during chaincode instantiation
		request.transientMap = transientMap;
	}

	return request;
}

function getOrgPeers(orgName) {
	var peers = [];
	var org = ORGS[orgName];
	for (let key in org) {
		if (org.hasOwnProperty(key)) {
			if (key.indexOf('peer') === 0) {
				peers.push(org[key]);
			}
		}
	}

	return peers;
}

/**
* instantiate fabric-client object and register block events to interact with the channel
* @channelConfig {Object}, see the 'channel' definition in fabric's configuration file
* @return {Promise}, Promise.resolve({org{String}, client{Object}, channel{Object}, submitter{Object}, eventhubs{Array}});
*/
function getcontext(channelConfig) {

	var index = 0;
	Client.setConfigSetting('request-timeout', 12000000);
	var channel_name = channelConfig.name;
	var idx = Math.floor(Math.random() * channelConfig.organizations.length);
	var userOrg = channelConfig.organizations[0];
	var client = new Client();
	var channel = client.newChannel(channel_name);
	var orgName = ORGS[userOrg].name;
	var cryptoSuite = Client.newCryptoSuite();
	var eventhubs = [];
	cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({ path: testUtil.storePathForOrg(orgName) }));
	client.setCryptoSuite(cryptoSuite);

	var caRootsPath = ORGS.orderer.tls_cacerts;
	let data = fs.readFileSync(path.join(__dirname, rootPath, caRootsPath));
	let caroots = Buffer.from(data).toString();

	channel.addOrderer(
		client.newOrderer(
			ORGS.orderer.url,
			{
				'pem': caroots,
				'ssl-target-name-override': ORGS.orderer['server-hostname'],
				"grpc.max_receive_message_length": -1,
				"grpc.max_send_message_length": -1
			}
		)
	);

	var orgName = ORGS[userOrg].name;
	return Client.newDefaultKeyValueStore({ path: testUtil.storePathForOrg(orgName) })
		.then((store) => {
			if (store) {
				client.setStateStore(store);
			}
			return testUtil.getSubmitter(client, null, true, userOrg);
		}).then((admin) => {
			the_user = admin;

			// set up the channel to use each org's random peer for
			// both requests and events
			var peerUrls = [];
			for (let i in channelConfig.organizations) {

				let org = channelConfig.organizations[i];
				let peers = getOrgPeers(org);
				if (peers.length === 0) {
					throw new Error('could not find peer of ' + org);
				}
				let peerInfo = peers[0];
				let data = fs.readFileSync(path.join(__dirname, rootPath, peerInfo['tls_cacerts']));
				let peer = client.newPeer(
					peerInfo.requests,
					{
						pem: Buffer.from(data).toString(),
						'ssl-target-name-override': peerInfo['server-hostname'],
						"grpc.max_receive_message_length": -1,
						"grpc.max_send_message_length": -1
					}
				);
				targets.push(peer);
				peerUrls.push(peerInfo.requests)
				channel.addPeer(peer);

			}

			return channel.initialize();
		})
		.then((nothing) => {
			return Promise.resolve({
				org: userOrg,
				client: client,
				channel: channel,
				submitter: the_user,
				eventhubs: eventhubs
			});
		})
		.catch((err) => {
			return Promise.reject(err);
		});
}
module.exports.getcontext = getcontext;


function releasecontext(context) {
	if (context.hasOwnProperty('eventhubs')) {
		for (let key in context.eventhubs) {
			var eventhub = context.eventhubs[key];
			if (eventhub && eventhub.isconnected()) {
				eventhub.disconnect();
			}
		}
		context.eventhubs = [];
	}
	return Promise.resolve();
}
module.exports.releasecontext = releasecontext;

function invokebycontext(context, id, version, args, timeout) {

	var userOrg = context.org;
	var client = context.client;
	var channel = context.channel;
	var eventhubs = context.eventhubs;
	var time0 = new Date().getTime() / 1000;
	const txIdObject = context.client.newTransactionID();
	const tx_id = txIdObject.getTransactionID().toString();

	var invoke_status = {
		id: txIdObject.getTransactionID(),
		status: 'created',
		time_create: new Date().getTime() / 1000,
		time_valid: 0,
		time_endorse: 0,
		time_order: 0,
		result: null
	};
	var pass_results = null;

	// TODO: should resolve endorsement policy to decides the target of endorsers
	// now random peers ( one peer per organization ) are used as endorsers as default, see the implementation of getContext
	// send proposal to endorser

	var f = args[0];
	args.shift();
	var request = {
		chaincodeId: id,
		fcn: f,
		args: args,
		txId: txIdObject,
	};

	return channel.sendTransactionProposal(request)
		.then((results) => {
			
			pass_results = results;
			invoke_status.time_endorse = new Date().getTime() / 1000
			var proposalResponses = pass_results[0];

			var proposal = pass_results[1];
			var all_good = true;

			for (let i in proposalResponses) {
				let one_good = false;
				let proposal_response = proposalResponses[i];
				if (proposal_response.response && proposal_response.response.status === 200) {
					// TODO: the CPU cost of verifying response is too high.
					// Now we ignore this step to improve concurrent capacity for the client
					// so a client can initialize multiple concurrent transactions
					// Is it a reasonable way?
					// one_good = channel.verifyProposalResponse(proposal_response);
					one_good = true;
				}
				all_good = all_good & one_good;
			}
			if (all_good) {
				// check all the read/write sets to see if the same, verify that each peer
				// got the same results on the proposal
				all_good = channel.compareProposalResponseResults(proposalResponses);
			}
			if (all_good) {
				invoke_status.result = proposalResponses[0].response.payload;

				var request = {
					proposalResponses: proposalResponses,
					proposal: proposal,
				};

				var deployId = txIdObject.getTransactionID();
				var orderer_response;
				return channel.sendTransaction(request)
					.then((response) => {
						orderer_response = response;
						invoke_status.time_order = new Date().getTime() / 1000;
						return Promise.resolve(orderer_response);
					}, () => {

						throw new Error('Failed to get valid proposal from orderer');
						//throw new Error('Failed to get valid event notification');
					});
			} else {
				throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
			}
		}).then((response) => {
			return Promise.resolve(invoke_status)
		})
		.catch((err) => {

			// return resolved, so we can use promise.all to handle multiple invoking
			// invoke_status is used to judge the invoking result
			// logger.error('Invoke chaincode failed, ' + (err.stack?err.stack:err));
			/*invoke_status.time_valid = process.uptime();
			invoke_status.status     = 'failed';*/
			return Promise.resolve(invoke_status);
		});
};
module.exports.invokebycontext = invokebycontext;

function querybycontext(context, id, version, args) {
	var userOrg = context.org;
	var client = context.client;
	var channel = context.channel;
	var eventhubs = context.eventhubs;
	const txIdObject = context.client.newTransactionID();
	const tx_id = txIdObject.getTransactionID().toString();

	var invoke_status = {
		id: tx_id,
		status: 'created',
		time_create: new Date().getTime() / 1000,
		time_valid: 0,
		result: null
	};
	var f = args[0];
	args.shift();
	var request = {
		chaincodeId: id,
		chaincodeVersion: version,
		txId: txIdObject,
		fcn: f,
		args: args
	};
	return channel.queryByChaincode(request)
		.then((responses) => {
			if (responses.length > 0) {
				var value = responses[0];
				if (value instanceof Error) {
					throw value;
				}
				for (let i = 1; i < responses.length; i++) {
					if (responses[i].length !== value.length || !responses[i].every(function (v, idx) {
						return v === value[idx];
					})) {
						throw new Error('conflicting query responses');
					}
				}
				invoke_status.time_valid = new Date().getTime() / 1000;
				invoke_status.result = responses[0];
				invoke_status.status = 'success';
				return Promise.resolve(invoke_status);
			}
			else {
				throw new Error('no query responses');
			}
		})
		.catch((err) => {
			logger.error('Query failed, ' + (err.stack ? err.stack : err));
			invoke_status.time_valid = new Date().getTime() / 1000;
			invoke_status.status = 'failed';
			return Promise.resolve(invoke_status);
		});
};

module.exports.querybycontext = querybycontext;

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports.sleep = sleep;

function loadMSPConfig(name, mspdir) {
	var msp = {};
	msp.id = name;
	msp.rootCerts = readAllFiles(path.join(__dirname, rootPath, mspdir, 'cacerts'));
	msp.admins = readAllFiles(path.join(__dirname, rootPath, mspdir, 'admincerts'));
	return msp;
}
module.exports.loadMSPConfig = loadMSPConfig;

function readAllFiles(dir) {
	var files = fs.readdirSync(dir);
	var certs = [];
	files.forEach((file_name) => {
		let file_path = path.join(dir, file_name);
		let data = fs.readFileSync(file_path);
		certs.push(data);
	});
	return certs;
}
module.exports.readAllFiles = readAllFiles;
