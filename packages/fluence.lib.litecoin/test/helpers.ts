import 'jest';
import { LitecoinTransaction, LitecoinBlock } from '../src';
import BigNumber from 'bignumber.js';

export function checkBlock(block: LitecoinBlock) {
    expect(typeof block.hash === 'string').toBeTruthy();
    expect(typeof block.height === 'number').toBeTruthy();
    expect(typeof block.network === 'string').toBeTruthy();
    expect(typeof block.nonce === 'number').toBeTruthy();
    expect(typeof block.parentHash === 'string').toBeTruthy();
    expect(typeof block.size === 'number').toBeTruthy();
    expect(typeof block.time === 'number').toBeTruthy();

    expect(block.transactions).toBeInstanceOf(Array);
    block.transactions.forEach((tx) => {
        checkTx(tx);
    });
}

export function checkTx(tx: LitecoinTransaction) {
    if (tx.hasOwnProperty('blockHash')) {
        expect(typeof tx.blockHash === 'string').toBeTruthy();
    }
    if (tx.hasOwnProperty('blockHeight')) {
        expect(typeof tx.blockHeight === 'number').toBeTruthy();
    }
    if (tx.hasOwnProperty('blockTime')) {
        expect(typeof tx.blockTime === 'number').toBeTruthy();
    }

    expect(typeof tx.hash === 'string').toBeTruthy();

    expect(tx.from).toBeInstanceOf(Array);
    tx.from.forEach((sender) => {
        if (sender.address) {
            expect(typeof sender.address === 'string');
        }
    });

    expect(tx.to).toBeInstanceOf(Array);
    tx.to.forEach((recipient) => {
        expect(typeof recipient.address === 'string');
        expect(recipient.amount).toBeInstanceOf(BigNumber);
    });
}

export function fnMockOnce(object: any, fieldName: string, mockFn: (...args: Array<any>) => any) {
    const oldValue = object[fieldName];
    object[fieldName] = (...args: Array<any>) => {
        object[fieldName] = oldValue;
        return mockFn(...args);
    };
}
