import { QueueListenerJob } from './queue.listener.job';
import { Message } from '@applicature/synth.queues';
import { ScheduledTxHandlerService } from '../services';
import { Scheme } from '@fluencesh/fluence.lib.services';

export abstract class ScheduleTxQueueListenerJob extends QueueListenerJob {
    private handler: ScheduledTxHandlerService;

    public async init() {
        await super.init();

        this.handler = this.pluginManager.getServiceByClass(ScheduledTxHandlerService);
    }

    protected async processMessage(message: Message) {
        const data = message.data as Scheme.ScheduledTxJobData;
        await this.handler.handle(data.scheduledTxId);
    }
}
