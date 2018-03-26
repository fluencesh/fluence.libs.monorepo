import { Hashtable, PluginManager, Service } from '@applicature/multivest.core';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import { Scheme } from '../../types';
import { WebhookActionItemObjectService } from '../object/webhook.action.service';

export interface WebHookCallResult {
    request: {
        method: string,
        headers: Hashtable<string>,
        data: Hashtable<any>
    };
    response: {
        body: string;
        headers: Hashtable<string>;
        statusCode: number;
        statusMessage: string;
    };
    error: any;
}

export class WebHookCallerService extends Service {
    protected webHookObjectService: WebhookActionItemObjectService;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        // @TODO: set project dao
    }

    public getServiceId(): string {
        return 'service.webhooks';
    }

    public async send(
        action: Scheme.WebHookActionItem,
        timeoutInMs: number
    ): Promise<WebHookCallResult> {

        // @TODO: calculate HASH

        const options: AxiosRequestConfig = {
            url: action.webHookUrl,

            method: 'POST',

            // baseURL: this.url,
            timeout: timeoutInMs,

            headers: {
                'Content-Type': 'application/json'
            },

            data: {
                blockChainId: action.blockChainId,
                networkId: action.networkId,

                blockHash: action.blockHash,
                blockHeight: action.blockHeight,
                blockTime: action.blockTime,

                minConfirmations: action.minConfirmations,
                confirmations: action.confirmations,

                txHash: action.txHash,

                address: action.address,

                type: action.type,
                refId: action.refId, // AddressSubscription id or EthereumContractSubscription id

                eventId: action.eventId,
                params: action.params
            }
        };

        let response: AxiosResponse;

        let error;

        try {
            response = await axios(options);
        }
        catch (err) {
            error = err;
        }

        return {
            request: {
                method: options.method,
                headers: options.headers,
                data: options.data
            },
            response: {
                body: response.data,
                headers: response.headers,
                statusCode: response.status,
                statusMessage: response.statusText
            },
            error
        };
    }
}
