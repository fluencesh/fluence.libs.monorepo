import { Hashtable, PluginManager, Service } from '@applicature-private/core.plugin-manager';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Scheme } from '../../types';
import { WebhookActionItemObjectService } from '../object/webhook.action.service';

export class WebhookCallerService extends Service {
    protected webhookObjectService: WebhookActionItemObjectService;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        // @TODO: set project dao
    }

    public async init() {
        await super.init();

        this.webhookObjectService = this.pluginManager.getServiceByClass(
            WebhookActionItemObjectService
        ) as WebhookActionItemObjectService;
    }

    public getServiceId(): string {
        return 'service.webhooks';
    }

    public async send(action: Scheme.WebhookActionItem, timeoutInMs: number): Promise<Scheme.WebhookCallResult> {
        // @TODO: calculate HASH

        const options: AxiosRequestConfig = {
            url: action.webhookUrl,

            method: 'POST',

            // baseURL: this.url,
            timeout: timeoutInMs,

            headers: {
                'Content-Type': 'application/json'
            },

            data: {
                blockchainId: action.blockchainId,
                networkId: action.networkId,

                blockHash: action.blockHash,
                blockHeight: action.blockHeight,
                blockTime: action.blockTime,

                confirmations: action.confirmations,
                minConfirmations: action.minConfirmations,

                txHash: action.txHash,

                address: action.address,

                clientId: action.clientId,
                projectId: action.projectId,

                refId: action.refId, // AddressSubscription id or EthereumContractSubscription id
                type: action.type,

                eventId: action.eventId,
                params: action.params
            }
        };

        let response: AxiosResponse;

        let error;

        try {
            response = await axios(options);
        } catch (err) {
            error = err;
            response = {
                data: null,
                headers: {},
                status: 502,
                statusText: 'Bad Gateway'
            } as AxiosResponse;
        }

        return {
            error,
            request: {
                data: options.data,
                headers: options.headers,
                method: options.method,
            },
            response: {
                body: response.data,
                headers: response.headers,
                statusCode: response.status,
                statusMessage: response.statusText
            },
        };
    }
}
