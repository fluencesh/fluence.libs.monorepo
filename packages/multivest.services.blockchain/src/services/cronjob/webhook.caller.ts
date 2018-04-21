import {
    Job,
    PluginManager,
    Recipient,
    Transaction,
} from '@applicature/multivest.core';

import { Scheme } from '../../types';
import WebhookActionItem = Scheme.WebhookActionItem;
import { WebhookActionItemObjectService } from '../object/webhook.action.service';
import { WebhookCallerService } from '../webhook/webhook.caller.service';

interface RecipientAndTx {
    recipient: Recipient;
    tx: Transaction;
}

export class WebhookCaller extends Job {
    protected webhookService: WebhookActionItemObjectService;
    protected webhookCallerService: WebhookCallerService;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        this.webhookService =
            this.pluginManager.getServiceByClass(WebhookActionItemObjectService) as WebhookActionItemObjectService;
        this.webhookCallerService =
            this.pluginManager.getServiceByClass(WebhookCallerService) as WebhookCallerService;

        // @TODO: proejctService
    }

    public async init() {
        await super.init();
    }

    public getJobId() {
        return `webhook.caller`;
    }

    public async execute(): Promise<void> {
        const webHookLimit = await this.webhookService.listByStatus(Scheme.WebhookReportItemStatus.Created);

        for (const item of webHookLimit) {
            await this.processWebhook(item);
        }

        return;
    }

    protected async processWebhook(item: WebhookActionItem): Promise<void> {
        try {
            const { request, response, error } = await this.webhookCallerService.send(item, 1000000);

            let failReport: Scheme.WebhookFailedReport;

            if (error) {
                failReport = {
                    request: {
                        method: request.method,
                        headers: request.headers,
                        data: request.data
                    },

                    error: {
                        type: 'OTHER',
                        value: error
                    },

                    createdAt: new Date()
                };

                this.webhookService.addFailReport(
                    item.id,
                    failReport
                );
            }

            if (response.statusCode > 399) {
                failReport = {
                    request: {
                        method: request.method,
                        headers: request.headers,
                        data: request.data
                    },

                    response: {
                        data: response.body,
                        status: response.statusCode,
                        statusText: response.statusMessage,
                        headers: response.headers
                    },

                    error: {
                        type: 'INVALID_STATUS_CODE',
                        value: response.statusCode
                    },

                    createdAt: new Date()
                };

                this.webhookService.addFailReport(
                    item.id,
                    failReport
                );
            }
        }
        catch (error) {
            // @TODO: log it
        }

        return;
    }
}
