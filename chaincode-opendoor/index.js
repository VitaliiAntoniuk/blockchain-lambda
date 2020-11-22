/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const openDoorContract = require('./lib/openDoorContract');

module.exports.openDoorContract = openDoorContract;
module.exports.contracts = [openDoorContract];
