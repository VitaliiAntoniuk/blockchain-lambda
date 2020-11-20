/*
# Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# 
# Licensed under the Apache License, Version 2.0 (the "License").
# You may not use this file except in compliance with the License.
# A copy of the License is located at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# or in the "license" file accompanying this file. This file is distributed 
# on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either 
# express or implied. See the License for the specific language governing 
# permissions and limitations under the License.
#
*/

let configObject = {
    "caEndpoint": "ca.m-47buhsjjdzbuvppgvzcrdnz3hm.n-eot45dplyzefvjgv3bqt4ryutm.managedblockchain.us-east-1.amazonaws.com:30002\n",
    "peerEndpoint": "nd-erl7ritelffnjas5yyxcoru6ru.m-47buhsjjdzbuvppgvzcrdnz3hm.n-eot45dplyzefvjgv3bqt4ryutm.managedblockchain.us-east-1.amazonaws.com:30003",
    "ordererEndpoint": "grpcs://orderer.n-eot45dplyzefvjgv3bqt4ryutm.managedblockchain.us-east-1.amazonaws.com:30001\n",
    "channelName": "mychannel",
    "chaincodeId": "ngo",
    "cryptoFolder": '/tmp',
    "mspID": 'm-47BUHSJJDZBUVPPGVZCRDNZ3HM',
    "memberName": "member-ngo"
}

module.exports = configObject;