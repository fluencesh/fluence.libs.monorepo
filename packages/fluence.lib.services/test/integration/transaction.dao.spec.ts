import { Transaction } from '@applicature/core.plugin-manager';
import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
// import { Scheme } from '../../index';
import { Scheme } from '../../src/types';

import { MongodbTransactionDao } from '../../src/dao/mongodb/transaction.dao';
import { randomTransaction } from '../../src/generation/transaction';

describe('transaction dao', () => {
    let dao: MongodbTransactionDao;
    let transaction: Scheme.Transaction;
    let transactionIndex = -1;
    let connection: Db;
    const transactions: Array<Scheme.Transaction> = [];

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});

        dao = new MongodbTransactionDao(connection);
        await dao.remove({});

        for (let i = 0; i < 15; i++) {
            transactions.push(await dao.create(randomTransaction()));
        }
    });

    afterAll(async () => {
        await dao.remove({});

        await connection.close();
    });

    beforeEach(() => {
        transactionIndex += 1;
        transaction = transactions[transactionIndex];
    });

    it('should get transaction by uniqId', async () => {
        const got = await dao.getByUniqId(transaction.uniqId);
        expect(got).toEqual(transaction);
    });

    it('should get by transaction hash', async () => {
        const got = await dao.getByHash(transaction.ref.hash);
        expect(got).toEqual(transaction);
    });

    it('should list by network and status', async () => {
        const mined = transactions.filter(
            (item) => item.status === Scheme.TransactionStatus.Mined && item.blockChainId === transaction.blockChainId
        );
        const got = await dao.listByNetworkAndStatus(
            transaction.blockChainId, transaction.networkId, Scheme.TransactionStatus.Mined
        );
        expect(got.length).toEqual(mined.length);
    });

    it('should list by uniqId and network', async () => {
        const found = transactions.filter(
            (item) => item.uniqId === transaction.uniqId
        );
        const got = await dao.listByUniqId(transaction.blockChainId, transaction.networkId, transaction.uniqId);
        expect(got.length).toBe(found.length);
    });

    it('should find by sender address', async () => {
        const found = transactions.filter(
            (item) => item.ref.from[0].address === transaction.ref.from[0].address
        );
        const got = await dao.listByUniqId(transaction.blockChainId, transaction.networkId, transaction.uniqId);
        expect(got.length).toBe(found.length);
    });

    it('should set hash and status', async () => {
        const newHash = `0x${generateId()}`;
        await dao.setHashAndStatus(transaction.id, newHash, Scheme.TransactionStatus.Sent);
        const got = await dao.getByUniqId(transaction.uniqId);
        expect(got.ref.hash).toBe(newHash);
        expect(got.status).toBe(Scheme.TransactionStatus.Sent);
    });

    it('should set mined block', async () => {
        const block = {
            hash: `0x${generateId()}`,
            height: 13536475,
            time: Date.now()
        };
        await dao.setMinedBlock(
            transaction.blockChainId,
            transaction.networkId,
            transaction.ref.hash,
            block.hash,
            block.height,
            block.time
        );
        const got = await dao.getByUniqId(transaction.uniqId);
        expect(got.ref.blockHash).toBe(block.hash);
        expect(got.ref.blockHeight).toBe(block.height);
        expect(got.ref.blockTime).toBe(block.time);
    });

    it('should create transaction', async () => {
        const data = randomTransaction();
        const fresh = await dao.createTransaction(
            data.blockChainId,
            data.networkId,
            data.uniqId,
            data.ref as Transaction,
            data.status
        );
        const got = await dao.getByUniqId(data.uniqId);
        expect(got).toEqual(fresh);
    });
});
