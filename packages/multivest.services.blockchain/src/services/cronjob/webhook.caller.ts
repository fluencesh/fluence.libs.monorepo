import {
    Job,
    PluginManager,
    Recipient,
    Transaction,
} from '@applicature/multivest.core';

import { Scheme } from '../../types';
import WebHookActionItem = Scheme.WebHookActionItem;
import { WebhookActionItemObjectService } from '../object/webhook.action.service';
import { WebHookCallerService } from '../webhook/webhook.caller.service';

interface RecipientAndTx {
    recipient: Recipient;
    tx: Transaction;
}

export class WebHookCaller extends Job {
    protected webHookService: WebhookActionItemObjectService;
    protected webHookCallerService: WebHookCallerService;

    constructor(
        pluginManager: PluginManager,
        webHookService: WebhookActionItemObjectService,
        webHookCallerService: WebHookCallerService
    ) {
        super(pluginManager);

        // @TODO: proejctService
    }

    public getJobId() {
        return `webhook.caller`;
    }

    public async init() {
        return Promise.resolve();
    }

    public async execute(): Promise<void> {
        const webHookLimit = await this.webHookService.listByStatus(Scheme.WebhookReportItemStatus.Created);

        for (const item of webHookLimit) {
            await this.processWebHook(item);
        }

        return;
    }

    protected async processWebHook(item: WebHookActionItem): Promise<void> {
        try {
            const { request, response, error } = await this.webHookCallerService.send(item, 1000000);

            let failReport: Scheme.WebHookFailedReport;

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

                this.webHookService.addFailReport(
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

                this.webHookService.addFailReport(
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
