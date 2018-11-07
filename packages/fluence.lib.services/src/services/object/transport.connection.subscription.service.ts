import { Service } from '@applicature/core.plugin-manager';
import { Plugin } from '@applicature/core.mongodb';
import { DaoIds } from '../../constants';
import { TransportConnectionSubscriptionDao } from '../../dao';
import { Scheme } from '../../types';

export class TransportConnectionSubscriptionService extends Service {
    private dao: TransportConnectionSubscriptionDao;

    public getServiceId() {
        return 'transport.connection.subscription.service';
    }

    public async init() {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.dao =
            await mongodbPlugin.getDao(DaoIds.TransportConnectionSubscription) as TransportConnectionSubscriptionDao;
    }

    public getById(transportConnectionId: string) {
        return this.dao.getById(transportConnectionId);
    }

    public getByIdAndStatus(transportConnectionId: string, status: Scheme.TransportConnectionSubscriptionStatus) {
        return this.dao.getByIdAndStatus(transportConnectionId, status);
    }

    public list() {
        return this.dao.list();
    }

    public listByStatus(status: Scheme.TransportConnectionSubscriptionStatus) {
        return this.dao.listByStatus(status);
    }

    public listByIds(transportConnectionIds: Array<string>) {
        return this.dao.listByIds(transportConnectionIds);
    }

    public listByIdsAndStatus(
        transportConnectionIds: Array<string>,
        status: Scheme.TransportConnectionSubscriptionStatus
    ) {
        return this.dao.listByIdsAndStatus(transportConnectionIds, status);
    }

    public listByBlockchainInfo(blockchainId: string, networkId: string = null) {
        return this.dao.listByBlockchainInfo(blockchainId, networkId);
    }

    public listByStatusAndBlockchainInfo(
        status: Scheme.TransportConnectionSubscriptionStatus,
        blockchainId: string,
        networkId: string = null
    ) {
        return this.dao.listByStatusAndBlockchainInfo(status, blockchainId, networkId);
    }
}
