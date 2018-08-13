import { Transaction } from '@fluencesh/multivest.core';
import { BigNumber } from 'bignumber.js';
import * as faker from 'faker';
import { sample } from 'lodash';
import { v1 as generateId } from 'uuid';
import { Scheme } from '../types';

const trasactionStatuses = [
    Scheme.TransactionStatus.Created,
    Scheme.TransactionStatus.Mined,
    Scheme.TransactionStatus.Sent,
];

export const randomTransactionRef = (): Transaction => {
    return {
        hash: `0x${generateId()}`,
        blockHash: `0x${generateId()}`,
        blockHeight: Math.floor(Math.random() * 100000000),
        blockTime: faker.date.past().getTime(),
        fee: new BigNumber(String(Math.random() / 1000)) as any,
        from: [
            {
                address: `0x${generateId()}`,
            }
        ],
        to: [
            {
                address: `0x${generateId()}`,
                amount: new BigNumber(String(Math.random())) as any,
            }
        ]
    };
};

export const randomTransaction = (): Scheme.Transaction => {
    return {
        blockChainId: 'ETHEREUM',
        networkId: 'homestead',
        id: generateId(),
        uniqId: `ETHEREUM-${generateId()}`,
        ref: randomTransactionRef(),
        status: sample(trasactionStatuses)
    };
};
