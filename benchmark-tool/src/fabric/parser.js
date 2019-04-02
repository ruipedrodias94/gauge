/**
* Copyright Persistent Systems 2019. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*@file Implementation of kafka consumer to fetch confirmation time of transactions.
*/

const fs = require('fs');
const kafka_config = require('../../listener/kafka-config.json');
const logger = require('../comm/util');

/**
 * connect to Kafka, fetch block and confirmation time
 * @param {*} resultsArray 
 * @param {*} no_Of_Tx 
 */
let getResultConfirmation = (resultsArray, no_Of_Tx) => {

    return new Promise(function (resolve, reject) {

        var map = []
        resultsArray.forEach(function (internal_element) {
            map[internal_element.id] = internal_element

        })
        var globalArray = []
        globalArray.push(map)

        var kafka = require('kafka-node');
        var Consumer = kafka.Consumer;
        var client1 = new kafka.KafkaClient({ kafkaHost: kafka_config.broker_urls, requestTimeout: 300000000 });

        var options = {
            autoCommit: true,
            fetchMaxWaitMs: 1000,
            fetchMaxBytes: 4096 * 4096,
            encoding: 'buffer',
            groupId: "groupID"+process.pid
        };

        var topics = [{
            topic: kafka_config.topic

        }];

        var consumer = new Consumer(client1, topics, options);
        var finalresult = [];
        var isTxfound;
        var pendingCounter = 0

        consumer.on('message', function (message) {

            var buf = new Buffer(message.value); // Read string into a buffer.
            var data = buf.toString('utf-8')
            var block = JSON.parse(data).block

            if (block != undefined) {
                if (block.filtered_tx != undefined) {//For Fabric version >1.2

                    for (var index = 0; index < block.filtered_tx.length; index++) {
                        var channel_header = block.filtered_tx[index];

                        // search the globalArray if the Id exists or not. It will be present but in any one of the array in global Array

                        if (globalArray[0][channel_header["txid"]] != undefined || globalArray[0][channel_header.tx_id] != null) {

                            var object = globalArray[0][channel_header["txid"]]
                            object.time_valid = JSON.parse(data).validTime;
                            object.status = "success";
                            globalArray[0][channel_header["txid"]] = object
                            pendingCounter++
                            finalresult.push(object)
                        } else {

                            // not present // ** no need to handle actually**

                        }

                        if (pendingCounter == no_Of_Tx) {
                            resolve(finalresult)
                        }

                    }
                } else if (block.data != undefined) {//For fabric version <1.3
                    for (var index = 0; index < block.data.data.length; index++) {
                        var channel_header = block.data.data[index].payload.header.channel_header;

                        // serach the globalArray if the Id exists or not. It will be present but in any one of the array in global Array
                        if (globalArray[0][channel_header.tx_id] != undefined || globalArray[0][channel_header.tx_id] != null) {

                            var object = globalArray[0][channel_header.tx_id]
                            object.time_valid = JSON.parse(data).validTime;
                            object.status = "success";
                            globalArray[0][channel_header.tx_id] = object
                            pendingCounter++
                            finalresult.push(object)
                        } else {

                            // not present // ** no need to handle actually**

                        }

                        if (pendingCounter == no_Of_Tx) {
                            resolve(finalresult)
                        }

                    }
                }
            }



        });


        consumer.on('error', function (error) {

            logger.error("Error while consuming blocks from MQ", error)

        })
    })
}

module.exports = {
    getResultConfirmation
};