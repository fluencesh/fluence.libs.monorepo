import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { MongodbWebhookActionDao } from '../../src/dao/mongodb/webhook.action.dao';
import { Scheme } from '../../src/types';
import { randomWebhookAction } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('exchange dao', () => {
    let dao: MongodbWebhookActionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbWebhookActionDao(DbMock);
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

    it('getById() transfers correct arguments', async () => {
        const eventId = 'eventId';
        const refId = 'refId';
        const type: any = 'type';
        const blockHash = '0x';
        const blockHeight = 1;

        await dao.getByUniqueInfo(
            blockHash,
            blockHeight,
            type,
            refId,
            eventId
        );

        expect(collection.findOne).toHaveBeenCalledWith({
            blockHash,
            blockHeight,
            type,
            refId,
            eventId
        });
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

    it('listByStatus() transfers correct arguments', async () => {
        const status = Scheme.WebhookReportItemStatus.Created;
        await dao.listByStatus(status);

        expect(collection.find).toHaveBeenCalledWith({ status });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByStatusAndType() transfers correct arguments', async () => {
        const status = Scheme.WebhookReportItemStatus.Created;
        const type = Scheme.WebhookTriggerType.Address;
        await dao.listByStatusAndType(status, type);

        expect(collection.find).toHaveBeenCalledWith({ status, type });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByStatusAndType() transfers correct arguments', async () => {
        const status = Scheme.WebhookReportItemStatus.Created;
        const types = [ Scheme.WebhookTriggerType.Address ];
        await dao.listByStatusAndTypes(status, types);

        expect(collection.find).toHaveBeenCalledWith({ status, type: { $in: types } });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createAction() transfers correct arguments', async () => {
        const data = randomWebhookAction();

        await dao.createAction(
            data.clientId,
            data.projectId,

            data.blockchainId,
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
