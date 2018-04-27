import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbEthereumContractSubscriptionDao } from '../../src/dao/mongodb/ethereum.contract.subscription.dao';
import { EthereumContractSubscription } from '../../src/services/types/types';

import { omit, random } from 'lodash';
import { v1 as generateId } from 'uuid';

import { randomEthereumContractSubscription } from '../helper';

describe('ethereum contract subscription dao', () => {
    let dao: MongodbEthereumContractSubscriptionDao;
    const ethereumContractSubscriptions: Array<EthereumContractSubscription> = [];
    const ethereumContractSubscriptionsCount = 15;
    let ethereumContractSubscription: EthereumContractSubscription;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbEthereumContractSubscriptionDao(connection);
        dao.remove({});

        for (let i = 0; i < ethereumContractSubscriptionsCount; i++) {
            ethereumContractSubscriptions.push(await dao.create(randomEthereumContractSubscription()));
        }
    });

    beforeEach(() => {
        ethereumContractSubscription = ethereumContractSubscriptions[random(0, ethereumContractSubscriptionsCount - 1)];
    });

    afterAll(async () => {
        await connection.db('multivest').collection('ethereumContracts').remove({});

        connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(ethereumContractSubscription.id);

        expect(got).toEqual(ethereumContractSubscription);
    });

    it('should get by project id', async () => {
        const filtered = ethereumContractSubscriptions
            .filter((ecs) => ecs.projectId === ethereumContractSubscription.projectId);
        const got = await dao.listByProjectId(ethereumContractSubscription.projectId);

        expect(got).toEqual(filtered);
    });

    it('should get by client id', async () => {
        const filtered = ethereumContractSubscriptions
            .filter((ecs) => ecs.clientId === ethereumContractSubscription.clientId);
        const got = await dao.listByClientId(ethereumContractSubscription.clientId);

        expect(got).toEqual(filtered);
    });

    it('should create new ethereum contract subscription', async () => {
        const data = randomEthereumContractSubscription();
        const created = await dao.createContractSubscription(
            data.clientId,
            data.projectId,
            data.compatibleStandard,
            data.blockChainId,
            data.networkId,
            data.address,
            data.minConfirmations,
            data.abi,
            data.abiEvents,
            data.subscribedEvents,
            data.subscribeAllEvents,
            data.subscribed,
            data.isProjectActive,
            data.isClientActive
        );

        const got = (await dao.listByProjectId(data.projectId))[0];

        expect(created).toEqual(got);
    });

    it('should get by subscribed address id which has active project and active client', async () => {
        const data = randomEthereumContractSubscription();

        const created = await dao.createContractSubscription(
            data.clientId,
            data.projectId,
            data.compatibleStandard,
            data.blockChainId,
            data.networkId,
            data.address,
            data.minConfirmations,
            data.abi,
            data.abiEvents,
            data.subscribedEvents,
            data.subscribeAllEvents,
            data.subscribed,
            true,
            true
        );

        const got = await dao.listBySubscribedAddresses([ data.address ]);

        expect(got).toEqual([ created ]);

        await dao.remove({ id: created.id });
    });

    it('should not get by address when address belongs to subscription which has inactive project', async () => {
        const data = randomEthereumContractSubscription();

        const created = await dao.createContractSubscription(
            data.clientId,
            data.projectId,
            data.compatibleStandard,
            data.blockChainId,
            data.networkId,
            data.address,
            data.minConfirmations,
            data.abi,
            data.abiEvents,
            data.subscribedEvents,
            data.subscribeAllEvents,
            data.subscribed,
            false,
            true
        );

        const got = await dao.listBySubscribedAddresses([ data.address ]);

        expect(got).toEqual([]);

        await dao.remove({ id: created.id });
    });

    it('should not get by address when address belongs to subscription which has inactive client', async () => {
        const data = randomEthereumContractSubscription();

        const created = await dao.createContractSubscription(
            data.clientId,
            data.projectId,
            data.compatibleStandard,
            data.blockChainId,
            data.networkId,
            data.address,
            data.minConfirmations,
            data.abi,
            data.abiEvents,
            data.subscribedEvents,
            data.subscribeAllEvents,
            data.subscribed,
            true,
            false
        );

        const got = await dao.listBySubscribedAddresses([ data.address ]);

        expect(got).toEqual([]);

        await dao.remove({ id: created.id });
    });

    it(
        'should not get by address when address belongs to subscription which has inactive client and project',
        async () => {
            const data = randomEthereumContractSubscription();

            const created = await dao.createContractSubscription(
                data.clientId,
                data.projectId,
                data.compatibleStandard,
                data.blockChainId,
                data.networkId,
                data.address,
                data.minConfirmations,
                data.abi,
                data.abiEvents,
                data.subscribedEvents,
                data.subscribeAllEvents,
                data.subscribed,
                false,
                false
            );

            const got = await dao.listBySubscribedAddresses([ data.address ]);

            expect(got).toEqual([]);

            await dao.remove({ id: created.id });
        }
    );

    it('should set project active status', async () => {
        ethereumContractSubscription.isProjectActive = !ethereumContractSubscription.isProjectActive;

        await dao.setProjectActive(
            ethereumContractSubscription.projectId,
            ethereumContractSubscription.isProjectActive
        );

        const got = await dao.getById(ethereumContractSubscription.id);

        expect(got).toEqual(ethereumContractSubscription);
    });

    it('should set client active status', async () => {
        ethereumContractSubscription.isClientActive = !ethereumContractSubscription.isClientActive;

        await dao.setClientActive(
            ethereumContractSubscription.clientId,
            ethereumContractSubscription.isClientActive
        );

        const got = await dao.listByClientId(ethereumContractSubscription.clientId);

        got.forEach((ecs) => {
            expect(ecs.isClientActive).toEqual(ethereumContractSubscription.isClientActive);
        });
    });

    it('should set subscribed all events status', async () => {
        ethereumContractSubscription.subscribedEvents = ['data', 'exit'];
        ethereumContractSubscription.subscribeAllEvents = ethereumContractSubscription.subscribeAllEvents;

        await dao.setSubscribedEventsAndAllEvents(
            ethereumContractSubscription.id,
            ethereumContractSubscription.subscribedEvents,
            ethereumContractSubscription.subscribeAllEvents
        );

        const got = await dao.listByClientId(ethereumContractSubscription.clientId);

        expect(got).toEqual([ ethereumContractSubscription ]);
    });
});
