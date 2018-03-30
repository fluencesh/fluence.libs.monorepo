import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { MongodbWebHookActionDao } from '../../src/dao/mongodb/webhook.action.dao';
import { Scheme } from '../../src/types';
import { randomWebhookAction } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('exchange dao', () => {
    let dao: MongodbWebHookActionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbWebHookActionDao(DbMock);
        collection = CollectionMock as any;
    });

    beforeEach(() => {
        Object.keys(collection).forEach((key) => {
            const spy = collection[key] as jest.SpyInstance;
            spy.mockClear();
        });
    });

    it('getById() transfers correct arguments', async () => {
        await dao.getById('id');

        expect(collection.findOne).toHaveBeenCalledWith({ id: 'id' });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('listByClientId() transfers correct arguments', async () => {
        await dao.listByClientId('clientId');

        expect(collection.find).toHaveBeenCalledWith({ clientId: 'clientId' });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByProjectId() transfers correct arguments', async () => {
        await dao.listByProjectId('projectId');

        expect(collection.find).toHaveBeenCalledWith({ projectId: 'projectId' });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createAction() transfers correct arguments', async () => {
        const data = randomWebhookAction();

        await dao.createAction(
            data.clientId,
            data.projectId,

            data.blockChainId,
            data.networkId,

            data.blockHash,
            data.blockHeight,
            data.blockTime,

            data.minConfirmations,
            data.confirmations,

            data.txHash,

            data.address,

            data.type,
            data.refId,

            data.eventId,
            data.params
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('setConfirmationsAndStatus() transfers correct arguments', async () => {
        await dao.setConfirmationsAndStatus(
            'id',
            10,
            Scheme.WebhookReportItemStatus.Created
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    confirmations: 10,
                    status: Scheme.WebhookReportItemStatus.Created
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setStatus() transfers correct arguments', async () => {
        await dao.setStatus(
            'id',
            Scheme.WebhookReportItemStatus.Created
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    status: Scheme.WebhookReportItemStatus.Created
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });
});
