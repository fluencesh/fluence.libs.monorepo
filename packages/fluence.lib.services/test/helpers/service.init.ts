import { Db } from 'mongodb';
import {
    MongodbTransportConnectionDao,
    TransportConnectionService,
    MongodbProjectBlockchainSetupDao,
    ProjectBlockchainSetupService,
    MongodbSubscriptionBlockRecheckDao,
    SubscriptionBlockRecheckService,
    MongodbTransportConnectionSubscriptionDao,
    TransportConnectionSubscriptionService,
} from '../../src';
import { set } from 'lodash';
import { PluginManagerMock } from '../mock/plugin.manager.mock';

export function initTransportConnectionService(db: Db) {
    const dao = new MongodbTransportConnectionDao(db);
    const service = new TransportConnectionService(PluginManagerMock);

    set(service, 'transportConnectionDao', dao);

    return service;
}

export function initProjectBlockchainSetupService(db: Db) {
    const dao = new MongodbProjectBlockchainSetupDao(db);
    const transportConnectionService = initTransportConnectionService(db);
    const service = new ProjectBlockchainSetupService(PluginManagerMock);

    set(service, 'setupDao', dao);
    set(service, 'transportConnectionService', transportConnectionService);

    return service;
}

export function initSubscriptionBlockRecheckService(db: Db) {
    const dao = new MongodbSubscriptionBlockRecheckDao(db);
    const service = new SubscriptionBlockRecheckService(PluginManagerMock);
    set(service, 'dao', dao);
    return service;
}

export function initTransportConnectionSubscriptionService(db: Db) {
    const dao = new MongodbTransportConnectionSubscriptionDao(db);
    const service = new TransportConnectionSubscriptionService(PluginManagerMock);
    set(service, 'dao', dao);
    return service;
}
