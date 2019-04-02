/**
* Copyright Persistent Systems 2018. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
@file Implementation for Fabric Event listener to connect to the peer Event Hub and recieve blocks.
*/

'use strict';

const kafka = require('kafka-node');
const Client = require('fabric-client')
const fs = require('fs')
const path = require('path');
const Promise = require('promise');
var testUtil = require('../src/fabric/util.js');
const logger = require('../src/comm/util');
const rootPath = "../../"
var ORGS;
var evhub = require('../src/fabric/eventHub.js');

class FabricListener {
    constructor(kafka_config, client_kafka, producer, configPath) {
        this.testUtil = testUtil
        let args = require(configPath).blockchain;
        let fabricConfig = require(path.join(path.dirname(configPath), args.config))
        this.testUtil.init(path.join(path.dirname(configPath), args.config))
        this.peerEventObject = {}
        this.peerEventObject.eventUrl = fabricConfig.fabric.network.org1.peer1.events;
        this.peerEventObject.requesturl = fabricConfig.fabric.network.org1.peer1.requests;
        let tlsCert = fs.readFileSync(path.join(__dirname, rootPath, fabricConfig.fabric.network.org1.peer1['tls_cacerts']))
        this.peerEventObject.eventTlsca = tlsCert
        this.peerEventObject.eventServerHostName = fabricConfig.fabric.network.org1.peer1['server-hostname'];
        this.peerEventObject.orgMSP = fabricConfig.fabric.network.org1.mspid;
        this.peerEventObject.org = "org1";
        this.client = new Client();
        this.client_kafka = client_kafka
        this.producer = producer
        this.kafka_config = kafka_config
        this.channel_name = fabricConfig.fabric.channel[0].name
        this.fabricVersion = fabricConfig.fabric.fabricVersion
       
    }

    getBlocks() {
        var self = this
        self.client_kafka.on('error', function (error) {
            logger.error("Kafka client ERROR", error);
        });

        self.producer.on('ready', function () {
            Client.newDefaultKeyValueStore({ path: "../hfc/hfc-test-kvs_peerOrg1" }).then((store) => {

                self.client.setStateStore(store);
                return self.testUtil.getSubmitter(self.client, null, true, self.peerEventObject.org);

            }).then((admin) => {

                self.client._userContext = admin

                var channel = self.client.newChannel(self.channel_name);
                ORGS = Client.getConfigSetting('fabric').network;

                var caRootsPath = ORGS.orderer.tls_cacerts;
                let data = fs.readFileSync(path.join(__dirname, rootPath, caRootsPath));
                let caroots = Buffer.from(data).toString();

                channel.addOrderer(
                    self.client.newOrderer(
                        ORGS.orderer.url,
                        {
                            'pem': caroots,
                            'ssl-target-name-override': ORGS.orderer['server-hostname']
                        }
                    )
                );

                for (let org in ORGS) {
                    if (org.indexOf('org') === 0) {
                        for (let key in ORGS[org]) {
                            if (key.indexOf('peer') === 0) {
                                let data = fs.readFileSync(path.join(__dirname, rootPath, ORGS[org][key]['tls_cacerts']));
                                let peer = self.client.newPeer(
                                    ORGS[org][key].requests,
                                    {
                                        pem: Buffer.from(data).toString(),
                                        'ssl-target-name-override': ORGS[org][key]['server-hostname']
                                    }
                                );
                                channel.addPeer(peer);
                                }
                            }
                        }
                    }

                    var eventHub = new evhub(self.fabricVersion,self.peerEventObject.eventUrl,self.peerEventObject.requesturl,self.peerEventObject.eventTlsca,self.peerEventObject.eventServerHostName);

                    if(self.peerEventObject.eventUrl == null || self.peerEventObject.eventUrl == ""){
                        logger.error("Event url not defined")
                    }

                    let eh = eventHub.getEvents(self.client,channel);

                    eh.connect();
                    eh.registerBlockEvent((block) => {

                    var event_data = {}
                    event_data.validTime = new Date().getTime() / 1000
                    event_data.block = block

                    if(self.fabricVersion <= '1.2') {
                        logger.info("Received Block No", block.header.number, "at", event_data.validTime)
                    }else if(self.fabricVersion >= '1.3') {
                        logger.info("Received Block No", block.number, "at", event_data.validTime)
                    }
                    
                    var payload = [{
                        topic: self.kafka_config.topic,
                        messages: JSON.stringify(event_data),
                        partition: 0,
                        attributes: 1
                    }];

                    self.producer.send(payload, function (error, result) {
                        if (error) {
                            logger.error("Error while publishing block in kafka", error);
                        } else {
                            var formattedResult = result[0]

                        }
                    });

                },
                    (err) => {
                        logger.info("Error in chaincode Event listener :", err)
                    }
                );
            })

        })
        self.producer.on('error', function (error) {
            logger.error("Producer is not ready", error);
        });

    }

}

module.exports = FabricListener;
