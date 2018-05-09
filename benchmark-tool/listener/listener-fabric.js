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
const rootPath = "../"

class FabricListener {
    constructor(kafka_config, client_kafka, producer, configPath) {
        this.testUtil = testUtil
        let args = require(configPath).blockchain;
        let fabricConfig = require(path.join(path.dirname(configPath), args.config))
        this.testUtil.init(path.join(path.dirname(configPath), args.config))
        this.peerEventObject = {}
        this.peerEventObject.eventUrl = fabricConfig.fabric.network.org1.peer1.events;
        let tlsCert = fs.readFileSync(path.join(__dirname, rootPath, fabricConfig.fabric.network.org1.peer1['tls_cacerts']))
        this.peerEventObject.eventTlsca = tlsCert
        this.peerEventObject.eventServerHostName = fabricConfig.fabric.network.org1.peer1['server-hostname'];
        this.peerEventObject.orgMSP = fabricConfig.fabric.network.org1.mspid;
        this.peerEventObject.org = "org1";
        this.client = new Client();
        this.client_kafka = client_kafka
        this.producer = producer
        this.kafka_config = kafka_config
       
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
                let eh = self.client.newEventHub();
                eh.setPeerAddr(
                    self.peerEventObject.eventUrl,
                    {
                        pem: Buffer.from(self.peerEventObject.eventTlsca).toString(),
                        'ssl-target-name-override': self.peerEventObject.eventServerHostName,
                        'request-timeout': 12000000,
                        "grpc.max_receive_message_length": -1
                    }
                );
                eh.connect();
                eh.registerBlockEvent((block) => {

                    var event_data = {}
                    event_data.validTime = new Date().getTime() / 1000
                    event_data.block = block
                    logger.info("Received Block No", block.header.number, "at", event_data.validTime)
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
