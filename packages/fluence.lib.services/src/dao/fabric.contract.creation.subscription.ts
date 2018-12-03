import { SubscriptionDao } from './subscription.dao';
import { Scheme } from '../types';

export abstract class FabricContractCreationSubscriptionDao extends SubscriptionDao<Scheme.FabricContractCreation> {
    public abstract async createSubscription(
        clientId: string,
        projectId: string,
        transportConnectionId: string,
        methodName: string,
        inputTypes: Array<string>,
        minConfirmations: number
    ): Promise<Scheme.FabricContractCreation>;
}
