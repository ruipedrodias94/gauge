/**
* Copyright Persistent Systems 2019. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*@file Interface for channel based event hub to support multiple Fabric versions.
*/

'use strict'

class EventHubInterface {

    getEvents(client, channel) {
        throw new Error('event hub is not implemented for this version of fabric');
    }

}

module.exports = EventHubInterface;