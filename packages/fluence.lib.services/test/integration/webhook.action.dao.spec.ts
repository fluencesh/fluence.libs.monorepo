import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbWebhookActionDao } from '../../src/dao/mongodb/webhook.action.dao';
import { Scheme } from '../../src/types';

import { omit, random } from 'lodash';
import { v1 as generateId } from 'uuid';

import { randomWebhookAction } from '../helper';

describe('address subscription dao', () => {
    let dao: MongodbWebhookActionDao;
    const webhookActions: Array<Scheme.WebhookActionItem> = [];
    const webhookActionsCount = 15;
    let webhookAction: Scheme.WebhookActionItem;
    let connection: MongoClient;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});

        dao = new MongodbWebhookActionDao(connection as any);
        await dao.remove({});

        for (let i = 0; i < webhookActionsCount; i++) {
            webhookActions.push(await dao.create(randomWebhookAction()));
        }
    });

    beforeEach(() => {
        webhookAction = webhookActions[random(0, webhookActionsCount - 1)];
    });

    afterAll(async () => {
        await dao.remove({});

        await connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(webhookAction.id);

        expect(got).toEqual(webhookAction);
    });

    it('should get by unique info', async () => {
        const got = await dao.getByUniqueInfo(
            webhookAction.blockHash,
            webhookAction.blockHeight,
            webhookAction.type,
            webhookAction.refId,
            webhookAction.eventId
        );

        expect(got).toEqual(webhookAction);
    });

    it('should get by client id', async () => {
        const filtered = webhookActions.filter((wa) => wa.clientId === webhookAction.clientId);

        const got = await dao.listByClientId(webhookAction.clientId);

        expect(got).toEqual(filtered);
    });

    it('should get by project id', async () => {
        const filtered = webhookActions.filter((wa) => wa.projectId === webhookAction.projectId);

        const got = await dao.listByProjectId(webhookAction.projectId);

        expect(got).toEqual(filtered);
    });

    it('should get by status', async () => {
        const filtered = webhookActions.filter((wa) => wa.status === webhookAction.status);

        const got = await dao.listByStatus(webhookAction.status);

        expect(got).toEqual(filtered);
    });

    it('should get by status and type', async () => {
        const filtered =
            webhookActions.filter((wa) => wa.status === webhookAction.status && wa.type === webhookAction.type);

        const got = await dao.listByStatusAndType(webhookAction.status, webhookAction.type);

        expect(got).toEqual(filtered);
    });

    it('should get by status and types', async () => {
        const filtered =
            webhookActions.filter((wa) => wa.status === webhookAction.status && wa.type === webhookAction.type);

        const got = await dao.listByStatusAndTypes(webhookAction.status, [webhookAction.type]);

        expect(got).toEqual(filtered);
    });

    it('should create ethereum event log', async () => {
        const data = randomWebhookAction();

        const created = await dao.createAction(
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

        const got = await await dao.getById(created.id);

        expect(got).toEqual(created);
    });

    it('should set new confirmation and status', async () => {
        webhookAction.confirmations = random(1, 10);

        await dao.setConfirmationsAndStatus(
            webhookAction.id,
            webhookAction.confirmations,
            webhookAction.status
        );

        const got = await dao.getById(webhookAction.id);

        expect(got).toEqual(webhookAction);
    });

    it('should set new status', async () => {
        webhookAction.status = webhookAction.status === Scheme.WebhookReportItemStatus.Created
            ? Scheme.WebhookReportItemStatus.Sent
            : Scheme.WebhookReportItemStatus.Created;

        await dao.setStatus(
            webhookAction.id,
            webhookAction.status
        );

        const got = await dao.getById(webhookAction.id);

        expect(got).toEqual(webhookAction);
    });
});
