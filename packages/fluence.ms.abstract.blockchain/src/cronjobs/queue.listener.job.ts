import { Job, PluginManager } from '@applicature/synth.plugin-manager';
import { QueueService, QueueServiceManager, Message } from '@applicature/synth.queues';
import { Job as AgendaJob } from 'agenda';

export abstract class QueueListenerJob extends Job {
    private queueService: QueueService;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        const queueServiceManager = new QueueServiceManager(pluginManager);
        this.queueService = queueServiceManager.getQueueService() as QueueService;
    }

    public async execute(job: AgendaJob) {
        const queueName = job.attrs.data.queueName;
        const queueUniqueTag = await this.queueService.getUniqueTag(queueName);

        let message: Message = await this.queueService.receiveMessage(queueUniqueTag);
        while (message !== null) {
            await this.processMessage(message);
            message = await this.queueService.receiveMessage(queueUniqueTag);
        }
    }

    protected abstract processMessage(message: Message): Promise<void>;
}
