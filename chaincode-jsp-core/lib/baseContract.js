'use strict';

const { Contract } = require('fabric-contract-api');

class BaseContract extends Contract {

    async initLedger(ctx) {
        console.info('User initialized');
    }

    // CreateUser issues a new user to the world state with given details.
    // Not recommended use. Use method updateUser
    async createUser(ctx, email, balance, date) {
        const user = {
            id: email,
            email : email,
            Owner: email,
            balance: balance,
            createAt: date,
            updateAt: ''
        };
        ctx.stub.putState(email, Buffer.from(JSON.stringify(user)));
        return user;
    }

    // UpdateUserBalance updates an existing user balance in the world state with provided parameters.
    async updateUserBalance(ctx, email, balance, date) {
        let user = await this.readUser(ctx, email);
        if (!user || user.length === 0) {
            user = await this.createUser(ctx, email, balance, date);
        }else {
            user = JSON.parse(user);
            balance = user.balance + balance;
            if(balance < 0){
                throw new Error('Balance cant be empty');
            }
            user = {
                id: email,
                email : email,
                Owner: email,
                balance: balance,
                createAt: user.createAt,
                updateAt: date
            };
            ctx.stub.putState(email, Buffer.from(JSON.stringify(user)));
        }
        return user;
    }

    // ReadUser returns the user stored in the world state with given email.
    async readUser(ctx, email) {
        return  await ctx.stub.getState(email);
    }

    async getUser(ctx, email) {
        const assetJSON = await ctx.stub.getState(email);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The user ${email} does not exist`);
        }
        return assetJSON.toString();
    }

    // DeleteUser deletes an given email from the world state.
    async deleteUser(ctx, email) {
        const exists = await this.userExists(ctx, email);
        if (!exists) {
            throw new Error(`The user ${email} does not exist`);
        }
        return ctx.stub.deleteState(email);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async userExists(ctx, email) {
        const userJSON = await ctx.stub.getState(email);
        return userJSON && userJSON.length > 0;
    }

    // GetAllAssets returns all assets found in the world state.
    async getAllUsers(ctx) {
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

module.exports = BaseContract;
