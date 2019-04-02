/**
* Copyright Persistent Systems 2018. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
@file Implementation for Pre populating keys.
*/

var Client   = require('fabric-client')
var fs   = require('fs')
var path = require('path');
var cmd = process.argv[2];
var totalKeys = process.argv[3];
var granularity = parseInt(process.argv[4]);
const rootPath = "../../../../"
var startTime = null;
var endTime = null
Client.addConfigFile("fabric.json");
const logger = require('../../../src/comm/util');
var testUtil = require('../../../src/fabric/util.js');
testUtil.init("./fabric.json")
var ORGS = Client.getConfigSetting('fabric').network;
var channelName = Client.getConfigSetting('fabric').channel[0].name;
var chaincodes = Client.getConfigSetting('fabric').chaincodes;
var client  = new Client();
var channel = client.newChannel(channelName);
var evhub = require('../../../src/fabric/eventHub.js');
var fabricVersion = Client.getConfigSetting('fabric').fabricVersion;

Client.setConfigSetting('request-timeout', 200000000);

channel.addOrderer(
    client.newOrderer(
		ORGS.orderer.url,
		{
		"grpcs.max_receive_message_length": -1,
		'pem': Buffer.from(fs.readFileSync(path.join(__dirname, rootPath,ORGS.orderer.tls_cacerts))).toString(),
	    'ssl-target-name-override': ORGS.orderer["server-hostname"],
		"grpcs.max_send_message_length":-1
		}
    )
);
targets = []
let peer = client.newPeer(
						ORGS["org1"].peer1.requests,
						{
						"grpcs.max_receive_message_length": -1, 
						'pem': Buffer.from(fs.readFileSync(path.join(__dirname, rootPath, ORGS["org1"].peer1["tls_cacerts"]))).toString(),
						'ssl-target-name-override':ORGS["org1"].peer1["server-hostname"],
						 "grpcs.max_send_message_length":-1
						}
			);
channel.addPeer(peer);
Client.newDefaultKeyValueStore({path:"./hfc/hfc-test-kvs_peerOrg2"}).then((store) => {

	client.setStateStore(store);
	return testUtil.getSubmitter(client, null, true, "org1");
    
}).then((admin) => {

	logger.info("successfully enrolled admin!!")

	var eventHub = new evhub(fabricVersion,ORGS["org1"].peer1.events,ORGS["org1"].peer1.requests,fs.readFileSync(path.join(__dirname, rootPath, ORGS["org1"].peer1.tls_cacerts)),ORGS["org1"].peer1["server-hostname"]);

	eh = eventHub.getEvents(client,channel);
	
	eh.connect();								
	return channel.initialize();
	
}).then(()=>{
	
	logger.info("successfully intitialized chain!!")
	return channel.queryInfo(targets[0], true)
	

},(err) => {
		logger.error('Failed to initialize the channel: ',err);
	
}).then((blockchain_info)=>{

	height = blockchain_info.height.low;
	logger.info("height: = ",height)

		if(cmd == "-a"){
			
			startTime =  new Date().getTime();
			var count = parseInt(totalKeys)
			
			if(count <= granularity){
				return invokebycontext(chaincodes[0].id, chaincodes[0].version, ["0",count.toString()], "addaccounts","org1");
			
			}else{

				var promises = []
				var c = count/granularity;
				var rounds   = Array(c).fill(0);
				z=0;
				return new Promise(function(resolve,reject){
						
						eh.registerBlockEvent((block) => {
						
							logger.info("transaction completed: ",c);
							logger.info("start index: ",z);
							logger.info("end index: ",z+granularity);
							c--;
							z = z+granularity;
							temp = z
							if(c>0){
							
								invokebycontext(chaincodes[0].id, chaincodes[0].version, [temp.toString(),(temp+granularity).toString()], "addaccounts","org1").then(()=>{
									
								logger.info("invoke finished: ",temp.toString())
										//return sleep(1000)
								});
						
							}else{
									eh.disconnect();
									resolve();
							}
											
						});
					
						if(c>0){
						
								invokebycontext(chaincodes[0].id, chaincodes[0].version, [z.toString(),(z+granularity).toString()], "addaccounts","org1").then(()=>{
	
						
								});
						
						}
				})
				
			}
	
		
		}else if(cmd == "-d"){
			
			return invokebycontext(chaincodes[0].id, chaincodes[0].version, [], "deleteaccounts","org1");
		
		}else if(cmd == "-q"){
			startTime =  new Date().getTime();
			var count = totalKeys
			return querybycontext(chaincodes[0].id, chaincodes[0].version, [count], "checkprepopulatedata");
		}
		
	
	
}).then(()=>{
	endTime =  new Date().getTime();
	logger.info("timeTaken: ",endTime-startTime)
	logger.info("done")
//	monitor.printMaxStats();
//	monitor.printDefaultStats();
//	monitor.stop();
	fs.writeFileSync("time_100mn.txt", endTime-startTime)
	process.exit(1);
});


function querybycontext(id, version, args, fnName){
    
	return new Promise(function(resolve,reject){
	
		var tx_id = client.newTransactionID();
		
		var request = {
			chaincodeId : id,
			chaincodeVersion : version,
			txId: tx_id,
			fcn: fnName,
			args: args
		};

		channel.queryByChaincode(request,targets[0])
		.then((responses) => {
			
			if(responses.length > 0) {
				var value = responses[0];
				logger.info("returned value: ",value.toString('utf8'));
				if(value instanceof Error) {
					reject();
				}
				resolve();
			}
			else {
				reject(new Error('no query responses'));
			}
		})
		.catch((err) => {
			reject(err)
		});
		
	});
};

function invokebycontext(id, version, args, fnName,orgPath){
	
	
	return new Promise(function(resolve,reject){
	
	
		var tx_id = client.newTransactionID();
		
		//build invoke request
		var request = {
			chaincodeId : id,
			fcn: fnName,
			args: args,
			txId: tx_id,
		};
		// send proposal to endorser
		logger.info('args[0]: '+args[0]+' args[1]: '+args[1])
		channel.sendTransactionProposal(request)
		.then((results)=>{
			
			var proposalResponses = results[0];
			
			var proposal = results[1];
			
			var all_good = true;
			logger.info("all_good: ",all_good)
			if (all_good) {
				
				all_good = channel.compareProposalResponseResults(proposalResponses);
			}
			if (all_good) {
				var request = {
					proposalResponses: proposalResponses,
					proposal: proposal
				};
				logger.info("sending transaction to orderer")
				var sendPromise = channel.sendTransaction(request);
				return sendPromise		
			}
			
		},(err)=>{
		
			logger.error('Failed to send transaction for proposal: ',err);
			reject(err)
		
		}).then((response) => {

				logger.info('response: ',response)
				if (response.status === 'SUCCESS') {
						logger.info('Successfully sent transaction to the orderer.');
		
				} else {
					logger.error('Failed to order the transaction. Error code: ');

				}
				resolve()
		}, (err) => {

			logger.error('Failed to send transaction due to error: ',err);
			reject()
		
		});

	})
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


