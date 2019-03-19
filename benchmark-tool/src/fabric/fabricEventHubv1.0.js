/**
* Copyright Persistent Systems 2019. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*@file Implementation for event hub to support Fabric versions upto 1.2.
*/

'use strict'

var EventHubInterface = require('./eventHubInterface.js')

class FabricEventHubv1_0 extends EventHubInterface {

    constructor(eventUrl, requestUrl, grpcSettings) {
        super();
        this.eventUrl = eventUrl;
        this.requestUrl = requestUrl;
        this.grpcSettings = grpcSettings;
    }

    getEvents(client, channel) {
        let eh = client.newEventHub();
        eh.setPeerAddr(
            this.eventUrl, this.grpcSettings
        );
        return eh;
    }

}

module.exports = FabricEventHubv1_0;