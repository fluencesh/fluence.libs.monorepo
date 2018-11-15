import {
    MultivestError,
    PluginManager,
    Service,
} from '@applicature-private/core.plugin-manager';
import { BigNumber } from 'bignumber.js';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { ClientService } from '../object/client.service';
import { ProjectService } from '../object/project.service';
import { TransactionHashSubscriptionService } from '../object/transaction.hash.subscription.service';
import { ScBlockchainTransportProvider, ManagedScBlockchainTransport } from '../transports';
import { BlockchainService } from './index';

export abstract class ScBlockchainService<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends ScBlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedScBlockchainTransport<Transaction, Block, Provider>
> extends BlockchainService<Transaction, Block, Provider, ManagedBlockchainTransportService> {

    public getFeePrice(transportConnectionId: string): Promise<BigNumber> {
        return this.blockchainTransport.getFeePrice(transportConnectionId);
    }

    public getLogs(
        filters: Scheme.BlockchainEventFilter,
        transportConnectionId: string
    ): Promise<Array<Scheme.BlockchainEvent>> {
        return this.blockchainTransport.getLogs(filters, transportConnectionId);
    }

    public call(
        tx: Transaction,
        transportConnectionId: string
    ): Promise<string> {
        return this.blockchainTransport.call(tx, transportConnectionId);
    }

    public callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string | Array<string>>,
        transportConnectionId: string
    ): Promise<any> {
        return this.blockchainTransport.callContractMethod(
            contractEntity,
            methodName,
            inputTypes,
            inputValues,
            transportConnectionId
        );
    }

    public contractMethodFeeEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string | Array<string>>,
        transportConnectionId: string
    ): Promise<BigNumber> {
        return this.blockchainTransport.contractMethodFeeEstimate(
            contractEntity,
            methodName,
            inputTypes,
            inputValues,
            transportConnectionId
        );
    }
}
