import { PluginManager, Transaction } from '@fluencesh/multivest.core';
import { Scheme, WebhookCaller } from '@fluencesh/multivest.services.blockchain';
import * as logger from 'winston';
import { Errors } from '../../errors';
import { EthereumBlockchainService } from '../blockchain/ethereum';

interface ResponseBody {
    privateKey: string;
    tx: Transaction;
}

export class OraclizeWebhookCaller extends WebhookCaller {
    private blockchainService: EthereumBlockchainService;

    constructor(pluginManager: PluginManager, blockchainService: EthereumBlockchainService) {
        super(pluginManager);

        this.blockchainService = blockchainService;
    }

    protected getProcessingTypes(): Array<Scheme.WebhookTriggerType> {
        return [ Scheme.WebhookTriggerType.OraclizeSubscription ];
    }

    protected async processResponse(res: Scheme.WebhookCallResponse): Promise<void> {
        let body: ResponseBody;
        try {
            body = JSON.parse(res.body);
        } catch (ex) {
            logger.error(Errors.RESPONSE_BODY_IS_INVALID);

            return;
        }

        const { privateKey, tx } = body;
        const buffPrivateKey = Buffer.alloc(privateKey.length, privateKey);

        await this.blockchainService.sendTransaction(buffPrivateKey, tx);

        return;
    }
}
