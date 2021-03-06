'use strict';

const { Contract } = require('fabric-contract-api');

class OpenDoorContract extends Contract {

    async initLedger(ctx) {
        const assets = [
            {
                ID: 'first',
                message: 'Garden door open!',
                user: "Test",
                createAt: "2020-07-04 17:19:11",
            },
            {
                ID: 'second',
                message: 'Office door open!',
                user: "Test",
                createAt: "2020-07-04 17:19:11",
            }
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ID} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async createMessage(ctx, message, user, id, date) {
        const asset = {
            ID: id,
            message : message,
            user: user,
            createAt: date,
        };
        ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }

    // GetAllAssets returns all assets found in the world state.
    async getAllMessage(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


}

module.exports = OpenDoorContract;
