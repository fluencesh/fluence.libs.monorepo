import { MongoDBDao } from '@applicature/multivest.mongodb';
import {
    EthereumContractAbiItem,
    EthereumContractCompatibleStandard,
    EthereumContractSubscription
} from '../../types';
import {
    EthereumContractSubscriptionDao,
} from '../ethereum.contract.subscription.dao';

export class MongodbEthereumContractSubscriptionDao extends MongoDBDao<EthereumContractSubscription>
        implements EthereumContractSubscriptionDao {

    public getDaoId() {
        return 'ethereumContracts';
    }

    public getCollectionName() {
        return 'ethereumContracts';
    }

    public getDefaultValue() {
        return {} as EthereumContractSubscription;
    }

    public async createContractSubscription(
        clientId: string,
        projectId: string,

        compatibleStandard: EthereumContractCompatibleStandard,

        blockChainId: string,
        networkId: string,

        address: string,
        minConfirmations: number,

        abi: Array<EthereumContractAbiItem>,

        abiEvents: Array<string>,

        subscribedEvents: Array<string>,
        subscribeAllEvents: boolean,

        subscribed: boolean = true,
        isProjectActive: boolean = true,
        isClientActive: boolean = true
    ): Promise<EthereumContractSubscription> {
        return this.create({
            clientId,
            projectId,

            compatibleStandard,

            blockChainId,
            networkId,

            address,
            minConfirmations,

            abi,

            abiEvents,

            subscribedEvents,
            subscribeAllEvents,

            subscribed,

            isProjectActive,
            isClientActive,

            createdAt: new Date()
        });
    }

    public async getById(contractId: string): Promise<EthereumContractSubscription> {
        return this.getRaw({id: contractId});
    }

    public async listByProjectId(projectId: string): Promise<Array<EthereumContractSubscription>> {
        return this.listRaw({ projectId });
    }

    public async listByClientId(clientId: string): Promise<Array<EthereumContractSubscription>> {
        return this.listRaw({ clientId });
    }

    public async listBySubscribedAddresses(
        addresses: Array<string>
    ): Promise<Array<EthereumContractSubscription>> {
        return this.listRaw({ address: { $in: addresses } });
    }

    public async listBySubscribedAddress(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<EthereumContractSubscription>> {
        const filters: any = { address };

        if (clientId !== undefined) {
            filters.clientId = clientId;
        }

        if (projectId !== undefined) {
            filters.projectId = projectId;
        }

        return this.listRaw(filters);
    }

    public async setSubscribed(contractId: string, subscribed: boolean): Promise<void> {
        await this.updateRaw({ id: contractId }, { $set: { subscribed } });

        return;
    }

    public async setSubscribedEventsAndAllEvents(
        contractId: string,
        subscribedEvents: Array<string>,
        subscribeAllEvents: boolean
    ): Promise<void> {
        await this.updateRaw({ id: contractId }, { $set: { subscribedEvents, subscribeAllEvents } });

        return;
    }
}
