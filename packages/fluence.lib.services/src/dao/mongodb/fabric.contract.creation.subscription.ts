import { MongoDBDao } from '@applicature/synth.mongodb';
import { Scheme } from '../../types';
import { FabricContractCreationSubscriptionDao } from '../fabric.contract.creation.subscription';
import { DaoIds, DaoCollectionNames } from '../../constants';
import { MongodbSubscriptionDao } from './subscription.dao';

export class MongodbFabricContractCreationSubscriptionDao
    extends MongodbSubscriptionDao<Scheme.FabricContractCreationSubscription>
    implements FabricContractCreationSubscriptionDao {

    public getDaoId() {
        return DaoIds.FabricContractCreation;
    }

    public getCollectionName() {
        return DaoCollectionNames.FabricContractCreation;
    }

    public getDefaultValue() {
        return {} as Scheme.FabricContractCreationSubscription;
    }

    public createSubscription(
        clientId: string,
        projectId: string,
        transportConnectionId: string,
        methodName: string,
        inputTypes: Array<string>,
        minConfirmations: number
    ): Promise<Scheme.FabricContractCreationSubscription> {
        return this.create({
            clientId,
            projectId,
            transportConnectionId,
            methodName,
            inputTypes,
            minConfirmations
        });
    }
}
