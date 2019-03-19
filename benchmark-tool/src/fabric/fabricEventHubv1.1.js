/**
* Copyright Persistent Systems 2019. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*@file Implementation for channel based event hub to support Fabric versions from 1.3.
*/


'use strict'

var EventHubInterface = require('./eventHubInterface.js')

class FabricEventHubv1_1 extends EventHubInterface {

    constructor(eventUrl, requestUrl, grpcSettings) {
        super();
        this.eventUrl = eventUrl;
        this.requestUrl = requestUrl;
        this.grpcSettings = grpcSettings
    }

    getEvents(client, channel) {
        let eh = channel.newChannelEventHub(
            client.newPeer(
                this.requestUrl, this.grpcSettings
            ));

        return eh;
    }

}

module.exports = FabricEventHubv1_1;