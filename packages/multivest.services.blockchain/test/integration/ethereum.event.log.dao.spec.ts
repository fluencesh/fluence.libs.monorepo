import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbEthereumEventLogDao } from '../../src/dao/mongodb/ethereum.event.log.dao';
import { Scheme } from '../../src/types';

import { omit, random } from 'lodash';
import { v1 as generateId } from 'uuid';

import { randomEthereumEventLog } from '../helper';

describe('address subscription dao', () => {
    let dao: MongodbEthereumEventLogDao;
    const ethereumEventLogs: Array<Scheme.EthereumEventLog> = [];
    const ethereumEventLogsCount = 15;
    let ethereumEventLog: Scheme.EthereumEventLog;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbEthereumEventLogDao(connection);
        dao.remove({});

        for (let i = 0; i < ethereumEventLogsCount; i++) {
            ethereumEventLogs.push(await dao.create(randomEthereumEventLog()));
        }
    });

    beforeEach(() => {
        ethereumEventLog = ethereumEventLogs[random(0, ethereumEventLogsCount - 1)];
    });

    afterAll(async () => {
        await connection.db('multivest').collection('ethereumEvents').remove({});

        connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(ethereumEventLog.id);

        expect(got).toEqual(ethereumEventLog);
    });

    it('should get by list of id', async () => {
        const filtered = ethereumEventLogs.filter((eel, index) => index % 3);
        const filteredIds = filtered.map((eel) => eel.id);

        const got = await dao.listByIds(filteredIds);

        expect(got).toEqual(filtered);
    });

    it('should create ethereum event log', async () => {
        const data = randomEthereumEventLog();

        const created = await dao.createEvent(
            data.blockChainId,
            data.networkId,
            data.blockHash,
            data.blockHeight,
            data.blockTime,
            data.txHash,
            data.address,
            data.event,
            data.eventHash,
            data.params
        );

        const got = await await dao.getById(created.id);

        expect(got).toEqual(created);
    });
});
