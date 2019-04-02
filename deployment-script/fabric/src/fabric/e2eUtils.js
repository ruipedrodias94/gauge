/**
 * Modifications Copyright 2017 HUAWEI
 * Copyright 2017 IBM All Rights Reserved.
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

var path = require('path');
var fs = require('fs');
var util = require('util');

var Client = require('fabric-client');
var testUtil = require('./util.js');

var ORGS;
var rootPath = '../../../../'
var tx_id = null;
var the_user = null;
var evhub = require('../../../../benchmark-tool/src/fabric/eventHub.js');
var fabricVersion;

function init(config_path) {

	Client.addConfigFile(config_path);
	ORGS = Client.getConfigSetting('fabric').network;
	fabricVersion = Client.getConfigSetting('fabric').fabricVersion;

}
module.exports.init = init;

/*********************
* @org, key of the organization
* @chaincode, {id: ..., path: ..., version: ...}
* @t, tape object
*********************/
function installChaincode(org, chaincode, t) {
	Client.setConfigSetting('request-timeout', 60000);
	var channel_name = chaincode.channel;

	var client = new Client();
	var channel = client.newChannel(channel_name);

	var orgName = ORGS[org].name;
	var cryptoSuite = Client.newCryptoSuite();
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
				'ssl-target-name-override': ORGS.orderer['server-hostname']
			}
		)
	);

	var targets = [];
	for (let key in ORGS[org]) {
		if (ORGS[org].hasOwnProperty(key)) {
			if (key.indexOf('peer') === 0) {
				let data = fs.readFileSync(path.join(__dirname, rootPath, ORGS[org][key]['tls_cacerts']));
				let peer = client.newPeer(
					ORGS[org][key].requests,
					{
						pem: Buffer.from(data).toString(),
						'ssl-target-name-override': ORGS[org][key]['server-hostname']
					}
				);

				targets.push(peer);
				channel.addPeer(peer);
			}
		}
	}

	return Client.newDefaultKeyValueStore({
		path: testUtil.storePathForOrg(orgName)
	}).then((store) => {
		client.setStateStore(store);

		// get the peer org's admin required to send install chaincode requests
		return testUtil.getSubmitter(client, t, true /* get peer org admin */, org);
	}).then((admin) => {
		the_user = admin;

		// send proposal to endorser
		var request = {
			targets: targets,
			chaincodePath: chaincode.path,
			chaincodeId: chaincode.id,
			chaincodeVersion: chaincode.version
		};
		return client.installChaincode(request);
	},
		(err) => {
			throw new Error('Failed to enroll user \'admin\'. ' + err);
		}).then((results) => {
			var proposalResponses = results[0];


			var all_good = true;
			var errors = [];
			for (let i in proposalResponses) {
				let one_good = false;
				if (proposalResponses && proposalResponses[i].response && proposalResponses[i].response.status === 200) {
					one_good = true;
				} else {
					logger.error('install proposal was bad');
					errors.push(proposalResponses[i]);
				}
				all_good = all_good & one_good;
			}
			if (!all_good) {
				throw new Error(util.format('Failed to send install Proposal or receive valid response: %s', errors));
			}
		},
		(err) => {
			throw new Error('Failed to send install proposal due to error: ' + (err.stack ? err.stack : err));
		})
		.catch((err) => {
			t.fail('failed to install chaincode, ' + (err.stack ? err.stack : err));
			return Promise.reject(err);
		});
}
module.exports.installChaincode = installChaincode;


function instantiateChaincode(chaincode, endorsement_policy, upgrade, t) {
	Client.setConfigSetting('request-timeout', 86400000);

	var channel = testUtil.getChannel(chaincode.channel);
	if (channel === null) {
		return Promise.reject(new Error('could not find channel in config'));
	}
	var channel_name = channel.name;
	var userOrg = channel.organizations[0];

	var targets = [],
		eventhubs = [];
	var type = 'instantiate';
	if (upgrade) type = 'upgrade';
	// override t.end function so it'll always disconnect the event hub
	t.end = ((context, ehs, f) => {
		return function () {
			for (var key in ehs) {
				var eventhub = ehs[key];
				if (eventhub && eventhub.isconnected()) {
					logger.debug('Disconnecting the event hub');
					eventhub.disconnect();
				}
			}
			f.apply(context, arguments);
		};
	})(t, eventhubs, t.end);

	var client = new Client();
	var channel = client.newChannel(channel_name);

	var orgName = ORGS[userOrg].name;
	var cryptoSuite = Client.newCryptoSuite();
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
				'ssl-target-name-override': ORGS.orderer['server-hostname']
			}
		)
	);

	var targets = [];
	var transientMap = { 'test': 'transientValue' };

	return Client.newDefaultKeyValueStore({
		path: testUtil.storePathForOrg(orgName)
	}).then((store) => {

		client.setStateStore(store);
		return testUtil.getSubmitter(client, t, true /* use peer org admin*/, userOrg);

	}).then((admin) => {
		the_user = admin;

		for (let org in ORGS) {
			if (org.indexOf('org') === 0) {
				for (let key in ORGS[org]) {
					if (key.indexOf('peer') === 0) {
						let data = fs.readFileSync(path.join(__dirname, rootPath, ORGS[org][key]['tls_cacerts']));
						let peer = client.newPeer(
							ORGS[org][key].requests,
							{
								pem: Buffer.from(data).toString(),
								'ssl-target-name-override': ORGS[org][key]['server-hostname']
							}
						);
						targets.push(peer);
						channel.addPeer(peer);
					}
				}
			}
		}
		// an event listener can only register with a peer in its own org
		logger.debug(' create new eventhub %s', ORGS[userOrg]['peer1'].events);
		let data = fs.readFileSync(path.join(__dirname, rootPath, ORGS[userOrg]['peer1']['tls_cacerts']));

		var eventHub = new evhub(fabricVersion,ORGS[userOrg]['peer1'].events,ORGS[userOrg]['peer1'].requests,data,ORGS[userOrg]['peer1']['server-hostname']);
		let eh = eventHub.getEvents(client,channel);

		eh.connect();
		eventhubs.push(eh);

		// read the config block from the orderer for the channel
		// and initialize the verify MSPs based on the participating
		// organizations
		return channel.initialize();
	}, (err) => {
		throw new Error('Failed to enroll user \'admin\'. ' + err);

	}).then(() => {

		// the v1 chaincode has Init() method that expects a transient map
		if (upgrade) {
			let request = buildChaincodeProposal(client, the_user, chaincode, upgrade, transientMap, endorsement_policy);
			tx_id = request.txId;

			return channel.sendUpgradeProposal(request);
		} else {

			let request = buildChaincodeProposal(client, the_user, chaincode, upgrade, transientMap, endorsement_policy);
			tx_id = request.txId;

			return channel.sendInstantiateProposal(request);
		}

	}, (err) => {
		throw new Error('Failed to initialize the channel' + (err.stack ? err.stack : err));
	}).then((results) => {

		var proposalResponses = results[0];

		var proposal = results[1];
		var all_good = true;
		for (let i in proposalResponses) {
			let one_good = false;
			if (proposalResponses && proposalResponses[i].response && proposalResponses[i].response.status === 200) {
				// special check only to test transient map support during chaincode upgrade
				one_good = true;
			} else {
				logger.error(type + ' proposal was bad');
			}
			all_good = all_good & one_good;
		}
		if (all_good) {
			var request = {
				proposalResponses: proposalResponses,
				proposal: proposal,
			};

			// set the transaction listener and set a timeout of 5 mins
			// if the transaction did not get committed within the timeout period,
			// fail the test
			var deployId = tx_id.getTransactionID();

			var eventPromises = [];
			eventhubs.forEach((eh) => {
				let txPromise = new Promise((resolve, reject) => {
					let handle = setTimeout(reject, 300000);

					eh.registerTxEvent(deployId.toString(), (tx, code) => {
						clearTimeout(handle);
						eh.unregisterTxEvent(deployId);

						if (code !== 'VALID') {
							t.fail('The chaincode ' + type + ' transaction was invalid, code = ' + code);
							reject();
						} else {
							t.pass('The chaincode ' + type + ' transaction was valid.');
							resolve();
						}
					});
				});
				eventPromises.push(txPromise);
			});

			var sendPromise = channel.sendTransaction(request);
			return Promise.all([sendPromise].concat(eventPromises))
				.then((results) => {
					return results[0]; // just first results are from orderer, the rest are from the peer events

				}).catch((err) => {
					throw new Error('Failed to send ' + type + ' transaction and get notifications within the timeout period.');
				});

		} else {
			throw new Error('Failed to send ' + type + ' Proposal or receive valid response. Response null or status is not 200. exiting...');
		}
	}, (err) => {
		throw new Error('Failed to send ' + type + ' proposal due to error: ' + (err.stack ? err.stack : err));

	}).then((response) => {
		//TODO should look into the event responses
		if (!(response instanceof Error) && response.status === 'SUCCESS') {
			return Promise.resolve();
		} else {
			throw new Error('Failed to order the ' + type + 'transaction. Error code: ' + response.status);
		}
	}, (err) => {
		throw new Error('Failed to send instantiate due to error: ' + (err.stack ? err.stack : err));
	})
		.catch((err) => {
			t.fail('failed to instantiate chaincode, ' + (err.stack ? err.stack : err));
			return Promise.reject(err);
		});
};

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

module.exports.instantiateChaincode = instantiateChaincode;

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
	Client.setConfigSetting('request-timeout', 120000);
	var channel_name = channelConfig.name;
	// var userOrg = channelConfig.organizations[0];
	// choose a random org to use, for load balancing
	var idx = Math.floor(Math.random() * channelConfig.organizations.length);
	var userOrg = channelConfig.organizations[idx];

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
				'ssl-target-name-override': ORGS.orderer['server-hostname']
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
			for (let i in channelConfig.organizations) {
				let org = channelConfig.organizations[i];
				let peers = getOrgPeers(org);
				if (peers.length === 0) {
					throw new Error('could not find peer of ' + org);
				}
				let peerInfo = peers[Math.floor(Math.random() * peers.length)];
				let data = fs.readFileSync(path.join(__dirname, rootPath, peerInfo['tls_cacerts']));
				let peer = client.newPeer(
					peerInfo.requests,
					{
						pem: Buffer.from(data).toString(),
						'ssl-target-name-override': peerInfo['server-hostname']
					}
				);

				channel.addPeer(peer);

				// an event listener can only register with the peer in its own org
				if (org === userOrg) {

					var eventHub = new evhub(fabricVersion,peerInfo.events,peerInfo.requests,data,peerInfo['server-hostname']);

					let eh = eventHub.getEvents(client,channel);

					eventhubs.push(eh);
				}
			}
			// register event listener
			eventhubs.forEach((eh) => {
				eh.connect();
			});

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

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports.sleep = sleep;

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
