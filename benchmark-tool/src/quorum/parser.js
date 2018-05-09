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
const fs = require('fs');
const kafka_config = require('../../listener/kafka-config.json');
const logger = require('../comm/util');

let getResultConfirmation = (resultsArray, no_Of_Tx) => {
    return new Promise((resolve, reject) => {
        let offset_count = 0;
        try {
            offset_count = fs.readFileSync('offset.txt');
        } catch (err) {
            offset_count = 0;
        }
        let map = [];
        let pendingCounter = 0;
        let finalresult = [];
        //element is an array of objects with TXID for one round
        resultsArray.forEach((internal_element) => {
            if (internal_element.status == 'failed') {
                finalresult.push(internal_element);
                pendingCounter++;
            } else {
                map[internal_element.id] = internal_element;
            }
            //no_Of_Tx++
        });
        let globalArray = [];
        globalArray.push(map);

        const kafka = require('kafka-node');
        const Consumer = kafka.Consumer;
        const client1 = new kafka.KafkaClient({
            kafkaHost: kafka_config.broker_urls,
            requestTimeout: 300000000
        });
        const options = {
            autoCommit: true,
            fetchMaxWaitMs: 1000,
            fetchMaxBytes: 16384 * 16384,
            encoding: 'buffer',
            fromOffset: true
            //requestTimeout:300000
            // groupId: groupID
        };
        const topics = [
            {
                topic: kafka_config.topic,
                offset: offset_count
            }
        ];

        const consumer = new Consumer(client1, topics, options);
        let isTxfound;
        consumer.on('message', (message) => {
            const buf = new Buffer(message.value); // Read string into a buffer.
            const data = buf.toString('utf-8');
            offset_count = message.offset;
            fs.writeFileSync('offset.txt', offset_count);
            const block = JSON.parse(data).block;
            if (block != undefined && block.transactions != undefined) {
                for (let index = 0; index < block.transactions.length; index++) {
                    const tx_id = block.transactions[index];
                    // find in the globalArray if the Id exists or not. It will be present but in any one of the array in global Array
                    if (globalArray[0][tx_id] != undefined || globalArray[0][tx_id] != null) {
                        // present at index 0
                        const object = globalArray[0][tx_id];
                        object.time_valid = JSON.parse(data).validTime;
                        object.status = 'success';
                        globalArray[0][tx_id] = object;
                        pendingCounter++;
                        finalresult.push(object);
                    } else {
                        // not present // ** no need to handle actually**
                    }
                    if (pendingCounter == no_Of_Tx) {
                        logger.info('All resolved');
                        resolve(finalresult);
                    }
                }
            }
        });
        consumer.on('error', function (error) {
            logger.error('Error on consumer side', error);
        });
    });
};

module.exports = {
    getResultConfirmation
};