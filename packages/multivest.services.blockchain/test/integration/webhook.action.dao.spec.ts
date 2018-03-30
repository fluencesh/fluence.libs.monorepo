import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbWebHookActionDao } from '../../src/dao/mongodb/webhook.action.dao';
import { Scheme } from '../../src/types';

import { omit, random } from 'lodash';
import { v1 as generateId } from 'uuid';

import { randomWebhookAction } from '../helper';

describe('address subscription dao', () => {
    let dao: MongodbWebHookActionDao;
    const webhookActions: Array<Scheme.WebHookActionItem> = [];
    const webhookActionsCount = 15;
    let webhookAction: Scheme.WebHookActionItem;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbWebHookActionDao(connection);
        dao.remove({});

        for (let i = 0; i < webhookActionsCount; i++) {
            webhookActions.push(await dao.create(randomWebhookAction()));
        }
    });

    beforeEach(() => {
        webhookAction = webhookActions[random(0, webhookActionsCount - 1)];
    });

    afterAll(async () => {
        connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(webhookAction.id);

        expect(got).toEqual(webhookAction);
    });

    it('should get by client id', async () => {
        const filtered = webhookActions.filter((eel) => eel.clientId === webhookAction.clientId);

        const got = await dao.listByClientId(webhookAction.clientId);

        expect(got).toEqual(filtered);
    });

    it('should get by project id', async () => {
        const filtered = webhookActions.filter((eel) => eel.projectId === webhookAction.projectId);

        const got = await dao.listByProjectId(webhookAction.projectId);

        expect(got).toEqual(filtered);
    });

    it('should create ethereum event log', async () => {
        const data = randomWebhookAction();

        const created = await dao.createAction(
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
