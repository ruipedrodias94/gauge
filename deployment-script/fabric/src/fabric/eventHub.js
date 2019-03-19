/**
* Copyright Persistent Systems 2019. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*@file Implementation for channel based event hub to support multiple Fabric versions.
*/

'use strict'

var EventHub = class {

    constructor(fabricVersion, eventUrl, requestUrl, data, serverHostname) {

        var grpcSettings = {
            pem: Buffer.from(data).toString(),
            'ssl-target-name-override': serverHostname,
            'request-timeout': 120000
        }

        this.eventObj = null;

        if (fabricVersion <= '1.2') {
            var eventHub1_0 = require('./fabricEventHubv1.0.js');
            this.eventObj = new eventHub1_0(eventUrl, requestUrl, grpcSettings);
        }
        else if (fabricVersion >= '1.3') {

            var eventHub1_1 = require('./fabricEventHubv1.1.js');
            this.eventObj = new eventHub1_1(eventUrl, requestUrl, grpcSettings);
        }
        else {
            throw new Error('Event Hub not implemented for fabric version, ' + this.fabricVersion);
        }
    }

    getEvents(client, channel) {
        return this.eventObj.getEvents(client, channel)
    }

}

module.exports = EventHub;