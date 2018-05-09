/**
* Copyright Persistent Systems 2018. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*@file Implementation for logger.
*/ 

'use strict';

const log4js = require('log4js');

const logger = log4js.getLogger('Benchmark');
logger.level = process.env.NODE_ENV === "production" ? 'error' : 'trace';

module.exports = logger;
