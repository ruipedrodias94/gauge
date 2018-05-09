/**
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
const Web3 = require('web3');
const logger = require('../src/comm/util');

/**
 * Quorum event listener
 */
class QuorumListener {
    /**
     * Intitialize with config
     * @param {*} kafkaConfig
     * @param {*} clientKafka
     * @param {*} producer
     * @param {*} configPath Path to cofig.json file
     */
    constructor(kafkaConfig, clientKafka, producer, configPath) {
        // Load quorum.json
        const config = require(configPath);
        const blockchainConfig = config.blockchain;
        const blockchainConfigPath = path.join(path.dirname(configPath), blockchainConfig.config);
        const quorumConfig = require(blockchainConfigPath);

        // Determine test type
        this.cmd = config.test.rounds.pop().cmd; // fetch the last round cmd
        this.isEventListener = blockchainConfig.isEventListener;

        // Construct Kafka
        this.clientKafka = clientKafka;
        this.producer = producer;
        this.kafkaConfig = kafkaConfig;

        // Determine listner node
        const nodeToConnect = process.env.CURRENT_NODE ? process.env.CURRENT_NODE : 'development';
        const nodeUrl = quorumConfig.quorum.network[nodeToConnect].httpProvider.url;
        this.web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

        // Select event type
        if (!this.isEventListener) {
            this.filter = this.web3.eth.filter('latest');
        } else {
            const contractList = quorumConfig.quorum.contracts;
            const contract = contractList.filter((contract) => {
                return contract.experimentName == this.cmd;
            })[0]; // return first element found matching experimentName from quorum.json
            (contract == undefined) // Unknown contract
                ? reject({contractInstance: null})
                : this.contractInstance = this.web3.eth.contract(contract.abi).at(contract.address),
                this.event = this.contractInstance.Finished({}, {fromBlock: 0, toBlock: 'pending'});
        }
    }

    /**
     * Start listening for the events
     */
    getBlocks() {
        const self = this;
        if (!this.isEventListener) {
            self.filter.watch((error, result) => {
                self.web3.eth.getBlock(result, false, (error, block) => {
                    if (!error) {
                        logger.info('current block #' + block.number);
                        let eventData = {};
                        eventData.validTime = new Date().getTime() / 1000;
                        eventData.block = block;
                        const payload = [{
                            topic: self.kafkaConfig.topic,
                            messages: JSON.stringify(eventData),
                            partition: 0,
                            attributes: 1, /* Use GZip compression for the payload */
                        }];

                        self.producer.send(payload, (error, result) => {
                            if (error) {
                                logger.error('Error during publishing in kafka', error);
                            }
                        });
                    } else {
                        logger.error(error.toString());
                    }
                });
            });
        } else {
            self.event.watch((error, result) => {
                if (!error) {
                    self.web3.eth.getBlock(result.blockNumber, false, (error, block) => {
                        if (!error) {
                            let eventData = {};
                            eventData.validTime = new Date().getTime() / 1000;
                            eventData.block = block;
                            const payload = [{
                                topic: self.kafkaConfig.topic,
                                messages: JSON.stringify(eventData),
                                partition: 0,
                                attributes: 1, /* Use GZip compression for the payload */
                            }];

                            self.producer.send(payload, (error, result) => {
                                if (error) {
                                    logger.error('Error during publishing in kafka', error);
                                }
                            });
                        } else {
                            logger.error(error.toString());
                        }
                    });
                } else {
                    logger.error(error.toString());
                }
            });
        }

        self.producer.on('error', (error) => {
            logger.error('Error', error);
        });
    }
}

module.exports = QuorumListener;
