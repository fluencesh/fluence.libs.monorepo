import { MongoDBDao } from '@applicature-private/multivest.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { EthereumContractSubscriptionDao } from '../ethereum.contract.subscription.dao';

export class MongodbEthereumContractSubscriptionDao extends MongoDBDao<Scheme.EthereumContractSubscription>
        implements EthereumContractSubscriptionDao {

    public getDaoId() {
        return DaoIds.EthereumContractSubscription;
    }

    public getCollectionName() {
        return DaoCollectionNames.EthereumContractSubscription;
    }

    public getDefaultValue() {
        return {} as Scheme.EthereumContractSubscription;
    }

    public async createSubscription(
        clientId: string,
        projectId: string,

        compatibleStandard: Scheme.EthereumContractCompatibleStandard,

        blockchainId: string,
        networkId: string,

        address: string,
        minConfirmations: number,

        abi: Array<Scheme.EthereumContractAbiItem>,

        abiEvents: Array<string>,

        subscribedEvents: Array<string>,
        subscribeAllEvents: boolean
    ): Promise<Scheme.EthereumContractSubscription> {
        return this.create({
            clientId,
            projectId,

            compatibleStandard,

            blockchainId,
            networkId,

            address,
            minConfirmations,

            abi,

            abiEvents,

            subscribedEvents,
            subscribeAllEvents,

            subscribed: true,
            createdAt: new Date(),
        });
    }

    public async getById(contractId: string): Promise<Scheme.EthereumContractSubscription> {
        return this.getRaw({id: contractId});
    }

    public async getByIdActiveOnly(contractId: string): Promise<Scheme.EthereumContractSubscription> {
        return this.getRaw({
            id: contractId,
            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
        });
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.listRaw({ projectId });
    }

    public async listByProjectIdActiveOnly(projectId: string): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.listRaw({
            projectId,
            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
        });
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.listRaw({
            clientId
        });
    }

    public async listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.listRaw({
            clientId,
            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
        });
    }

    public async listBySubscribedAddresses(
        addresses: Array<string>
    ): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.listRaw({ address: { $in: addresses } });
    }

    public async listBySubscribedAddressesActiveOnly(
        addresses: Array<string>
    ): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.listRaw({
            address: { $in: addresses },
            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
        });
    }

    public async listBySubscribedAddress(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.EthereumContractSubscription>> {
        const filters: any = { address };

        if (clientId !== undefined) {
            filters.clientId = clientId;
        }

        if (projectId !== undefined) {
            filters.projectId = projectId;
        }

        return this.listRaw(filters);
    }

    public async listBySubscribedAddressActiveOnly(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.EthereumContractSubscription>> {
        const filters: Partial<Scheme.EthereumContractSubscription> = { address };

        if (clientId !== undefined) {
            filters.clientId = clientId;
        }

        if (projectId !== undefined) {
            filters.projectId = projectId;
        }

        filters.subscribed = true;
        filters.isProjectActive = true;
        filters.isClientActive = true;

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

    public async setSubscribedByClientId(clientId: string, subscribed: boolean): Promise<void> {
        await this.updateRaw({ clientId }, {
            $set: {
                subscribed
            }
        });

        return;
    }

    public async setSubscribedByProjectId(projectId: string, subscribed: boolean): Promise<void> {
        await this.updateRaw({ projectId }, {
            $set: {
                subscribed
            }
        });

        return;
    }

    public async setClientActive(clientId: string, isActive: boolean): Promise<void> {
        await this.updateRaw({ clientId }, {
            $set: {
                isClientActive: isActive
            }
        });

        return;
    }

    public async setProjectActive(projectId: string, isActive: boolean): Promise<void> {
        await this.updateRaw({ projectId }, {
            $set: {
                isProjectActive: isActive
            }
        });

        return;
    }
}
