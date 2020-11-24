'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const { Context } = require('fabric-contract-api');
const { ChaincodeStub } = require('fabric-shim');

const AssetTransfer = require('../lib/baseContract.js');

let assert = sinon.assert;
chai.use(sinonChai);

const email = 'test@gmail.com';

describe('Asset Transfer Basic Tests', () => {
    let transactionContext, chaincodeStub, asset;
    beforeEach(() => {
        transactionContext = new Context();

        chaincodeStub = sinon.createStubInstance(ChaincodeStub);
        transactionContext.setChaincodeStub(chaincodeStub);

        chaincodeStub.putState.callsFake((key, value) => {
            if (!chaincodeStub.states) {
                chaincodeStub.states = {};
            }
            chaincodeStub.states[key] = value;
        });

        chaincodeStub.getState.callsFake(async (key) => {
            let ret;
            if (chaincodeStub.states) {
                ret = chaincodeStub.states[key];
            }
            return Promise.resolve(ret);
        });

        chaincodeStub.deleteState.callsFake(async (key) => {
            if (chaincodeStub.states) {
                delete chaincodeStub.states[key];
            }
            return Promise.resolve(key);
        });

        chaincodeStub.getStateByRange.callsFake(async () => {
            function* internalGetStateByRange() {
                if (chaincodeStub.states) {
                    // Shallow copy
                    const copied = Object.assign({}, chaincodeStub.states);

                    for (let key in copied) {
                        yield {value: copied[key]};
                    }
                }
            }

            return Promise.resolve(internalGetStateByRange());
        });

        asset = {
            id: email,
            email : email,
            Owner: email,
            balance: 100,
            createAt: '2020-11-23T18:26:09.260Z',
            updateAt: ''
        };
    });

    describe('Test CreateUser', () => {
        it('should return success on CreateAsset', async () => {
            let baseContract = new AssetTransfer();
            let user = await baseContract.createUser(transactionContext, asset.email, asset.balance, asset.createAt);
            expect(user).to.eql(asset);
        });
    });

    describe('Test ReadUser', () => {
        it('should return success on ReadUser', async () => {
            let assetTransfer = new AssetTransfer();
            await assetTransfer.createUser(transactionContext, asset.email, asset.balance, asset.createAt);

            let res = JSON.parse(await assetTransfer.readUser(transactionContext, asset.email));
            expect(res).to.eql(asset);
        });
        it('should return undefined on ReadUser', async () => {
            let assetTransfer = new AssetTransfer();

            let res = await assetTransfer.readUser(transactionContext, asset.email);
            expect(res).to.undefined;
        });
    });

    describe('Test existUser', () => {
        it('should return success on existUser', async () => {
            let assetTransfer = new AssetTransfer();
            await assetTransfer.createUser(transactionContext, asset.email, asset.balance, asset.createAt);
            let res = await assetTransfer.userExists(transactionContext, asset.email);
            expect(res).to.eql(true);
        });
    });

    describe('Test UpdateUser', () => {
        it('update exist user plus balance', async () => {
            let assetTransfer = new AssetTransfer();
            await assetTransfer.createUser(transactionContext, asset.email, asset.balance, asset.createAt);

            let updateAt = (new Date()).toISOString();
            let user = await assetTransfer.updateUserBalance(transactionContext, asset.email, 20, updateAt);
            let expected = {
                id: asset.email,
                email : asset.email,
                Owner: asset.email,
                balance: 120,
                createAt: asset.createAt,
                updateAt: updateAt
            };
            expect(user).to.eql(expected);
        });
        it('update not exist user', async () => {
            let assetTransfer = new AssetTransfer();
            await assetTransfer.createUser(transactionContext, asset.email, asset.balance, asset.createAt);

            let createAt = (new Date()).toISOString();
            let email = 'test2@gmail.com';
            let balance = 20;
            let user = await assetTransfer.updateUserBalance(transactionContext, email, balance, createAt);
            let expected = {
                id: email,
                email : email,
                Owner: email,
                balance: balance,
                createAt: createAt,
                updateAt: ''
            };
            expect(user).to.eql(expected);
        });
        it('update exist user minuses balance', async () => {
            let assetTransfer = new AssetTransfer();
            await assetTransfer.createUser(transactionContext, asset.email, asset.balance, asset.createAt);

            let updateAt = (new Date()).toISOString();
            let user = await assetTransfer.updateUserBalance(transactionContext, asset.email, -20, updateAt);
            let expected = {
                id: asset.email,
                email : asset.email,
                Owner: asset.email,
                balance: 80,
                createAt: asset.createAt,
                updateAt: updateAt
            };
            expect(user).to.eql(expected);
        });
        it('error minuses balance', async () => {
            let assetTransfer = new AssetTransfer();
            await assetTransfer.createUser(transactionContext, asset.email, 20, asset.createAt);

            let updateAt = (new Date()).toISOString();
            try {
                await assetTransfer.updateUserBalance(transactionContext, asset.email, -30, updateAt);
            } catch (err) {
                expect(err.message).to.equal('Balance cant be empty');
            }
        });
    });

    describe('Test DeleteUser', () => {
        it('should return error on DeleteUser', async () => {
            let assetTransfer = new AssetTransfer();
            await assetTransfer.createUser(transactionContext, asset.email, asset.balance, asset.createAt);

            try {
                await assetTransfer.deleteUser(transactionContext, 'test2@gmail.com');
                assert.fail('DeleteUser should have failed');
            } catch (err) {
                expect(err.message).to.equal('The user test2@gmail.com does not exist');
            }
        });

        it('should return success on DeleteUser', async () => {
            let assetTransfer = new AssetTransfer();
            await assetTransfer.createUser(transactionContext, asset.email, asset.balance, asset.createAt);

            await assetTransfer.deleteUser(transactionContext, asset.email);
            let ret = await chaincodeStub.getState(asset.email);
            expect(ret).to.equal(undefined);
        });
    });

    describe('Test getAllUsers', () => {
        it('should return success on getAllUsers', async () => {
            let assetTransfer = new AssetTransfer();

            await assetTransfer.createUser(transactionContext, asset.email, asset.balance, asset.createAt);
            await assetTransfer.createUser(transactionContext, 'test2@gmail.com', 20, asset.createAt);
            await assetTransfer.createUser(transactionContext, 'test3@gmail.com', 30, asset.createAt);

            let ret = await assetTransfer.getAllUsers(transactionContext);
            ret = JSON.parse(ret);
            expect(ret.length).to.equal(3);

            let expected = [
                {Record: {id: 'test@gmail.com', email: 'test@gmail.com', Owner: 'test@gmail.com', balance: 100, createAt: '2020-11-23T18:26:09.260Z', updateAt: ''}},
                {Record: {id: 'test2@gmail.com', email: 'test2@gmail.com', Owner: 'test2@gmail.com', balance: 20, createAt: '2020-11-23T18:26:09.260Z', updateAt: ''}},
                {Record: {id: 'test3@gmail.com', email: 'test3@gmail.com', Owner: 'test3@gmail.com', balance: 30, createAt: '2020-11-23T18:26:09.260Z', updateAt: ''}}
            ];

            expect(ret).to.eql(expected);
        });
    });
});
