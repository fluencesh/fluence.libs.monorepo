
import { Scheme } from '@applicature-restricted/multivest.services.blockchain';
import { createHash } from 'crypto';
import { random } from 'lodash';
import { v1 as generateId } from 'uuid';
import {
    EthereumContractCompatibleStandard,
    EthereumContractSubscription,
    EthereumEventLog
} from '../src/services/types/types';
import { getRandomAbi } from './mock/helper';

export function randomAddressSubscription(): Scheme.AddressSubscription {
    return {
        clientId: generateId(),
        projectId: generateId(),
        blockChainId: generateId(),
        networkId: generateId(),
        address: generateId(),
        minConfirmations: random(10, 100),
        subscribed: random(0, 1, true) > .5,
        isProjectActive: random(0, 1, true) > .5,
        isClientActive: random(0, 1, true) > .5,
        createdAt: new Date(),
    } as Scheme.AddressSubscription;
}

export function randomClient(): Scheme.Client {
    return {
        ethereumAddress: generateId(),
        status: random(0, 1, true) > .5 ? Scheme.ClientStatus.Active : Scheme.ClientStatus.Inactive,
        createdAt: new Date(),
    } as Scheme.Client;
}

export function randomEthereumContractSubscription(): EthereumContractSubscription {
    const randomNumber = random(0, 1, true);
    let compatibleStandard;
    if (randomNumber < .33) {
        compatibleStandard = EthereumContractCompatibleStandard.ERC20;
    } else if (randomNumber >= .33 && randomNumber < .67) {
        compatibleStandard = EthereumContractCompatibleStandard.ERC223;
    } else {
        compatibleStandard = EthereumContractCompatibleStandard.ERC721;
    }

    return {
        compatibleStandard,
        abi: [],
        abiEvents: [],
        subscribedEvents: [],
        subscribeAllEvents: true,
        ...randomAddressSubscription(),
    } as EthereumContractSubscription;
}

export function randomEthereumEventLog(): EthereumEventLog {
    return {
        id: generateId(),

        blockChainId: generateId(),
        networkId: generateId(),

        blockHash: generateId(),
        blockHeight: random(1, 1000),
        blockTime: random(500, 2000),

        txHash: generateId(),

        address: generateId(),

        event: 'data',
        eventHash: generateId(),

        params: { [generateId()]: generateId() },

        createdAt: new Date()
    } as Scheme.EthereumEventLog;
}

export function randomWebhookAction(): Scheme.WebhookActionItem {
    const failedCount = random(0, 5);

    const randomNumber = random(0, 1, true);
    let status;
    if (failedCount) {
        status = Scheme.WebhookReportItemStatus.Failed;
    } else if (randomNumber < .5) {
        status = Scheme.WebhookReportItemStatus.Created;
    } else {
        status = Scheme.WebhookReportItemStatus.Sent;
    }

    return {
        webhookUrl: `https://www.${generateId()}.eu`,

        clientId: generateId(),
        projectId: generateId(),

        blockChainId: generateId(),
        networkId: generateId(),

        blockHash: generateId(),
        blockHeight: random(1, 1000),
        blockTime: random(500, 2000),

        minConfirmations: random(10, 100),
        confirmations: random(1, 10),

        txHash: generateId(),

        address: generateId(),

        type: random(0, 1, true) > .5
            ? Scheme.WebhookTriggerType.Address
            : Scheme.WebhookTriggerType.EthereumContractEvent,
        refId: generateId(),

        eventId: generateId(),
        params: { [generateId()]: generateId() },

        failedCount,
        lastFailedAt: failedCount ? new Date() : null,

        fails: failedCount ? [{}] : [],

        status,

        createdAt: new Date()
    } as Scheme.WebhookActionItem;
}

export function randomContract() {
    return {
        address: createHash('sha1').update(random(0, 1000).toString(), 'utf8').digest('hex'),
        abi: getRandomAbi()
    };
}
