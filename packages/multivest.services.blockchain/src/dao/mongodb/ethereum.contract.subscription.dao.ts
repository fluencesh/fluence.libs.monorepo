import { MongoDBDao } from '@applicature/multivest.mongodb';
import { Scheme } from '../../types';
import { EthereumContractSubscriptionDao } from '../ethereum.contract.subscription.dao';

export class MongodbEthereumContractSubscriptionDao extends MongoDBDao<Scheme.EthereumContractSubscription>
        implements EthereumContractSubscriptionDao {

    public getDaoId() {
        return 'ethereumContracts';
    }

    public getCollectionName() {
        return 'ethereumContracts';
    }

    public getDefaultValue() {
        return {} as Scheme.EthereumContractSubscription;
    }

    public async createContractSubscription(
        clientId: string,
        projectId: string,

        compatibleStandard: Scheme.EthereumContractCompatibleStandard,

        blockChainId: string,
        networkId: string,

        address: string,
        minConfirmations: number,

        abi: Array<Scheme.EthereumContractAbiItem>,

        abiEvents: Array<string>,

        subscribedEvents: Array<string>,
        subscribeAllEvents: boolean,

        subscribed: boolean,
        isProjectActive: boolean,
        isClientActive: boolean
    ): Promise<Scheme.EthereumContractSubscription> {
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

            createdAt: new Date()
        });
    }

    public async getById(contractId: string): Promise<Scheme.EthereumContractSubscription> {
        return this.getRaw({id: contractId});
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.listRaw({ projectId });
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.listRaw({ clientId });
    }

    public async listBySubscribedAddresses(
        addresses: Array<string>
    ): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.listRaw({ address: {$in: addresses}, isProjectActive: true, isClientActive: true });
    }

    public async setSubscribed(contractId: string, subscribed: boolean): Promise<void> {
        await this.updateRaw({ id: contractId }, { $set: { subscribed } });

        return;
    }

    public async setProjectActive(
        projectId: string,
        isActive: boolean
    ): Promise<void> {
        await this.updateRaw({ projectId }, {
            $set: { isProjectActive: isActive }
        });

        return;
    }

    public async setClientActive(
        clientId: string,
        isActive: boolean
    ): Promise<void>  {
        await this.updateRaw({ clientId }, {
            $set: { isClientActive: isActive }
        });

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
