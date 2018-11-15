import { BigNumber } from 'bignumber.js';

const transactionMock = {
    gasPrice: new BigNumber(1),
    gasLimit: new BigNumber(1),
};
const blockMock: any = { transactions: [] };
const transactionReceiptMock = {};

export const ProviderMock = {
    getBlockNumber: jest.fn().mockImplementation(() => 1),
    getBlock: jest.fn().mockImplementation(() => blockMock),
    getTransaction: jest.fn().mockImplementation(() => transactionMock),
    sendTransaction: jest.fn().mockImplementation(() => ''),
    call: jest.fn().mockImplementation(() => ({})),
    getBalance: jest.fn().mockImplementation(() => 1),
    estimateGas: jest.fn().mockImplementation(() => 1),
    getGasPrice: jest.fn().mockImplementation(() => new BigNumber(0)),
    getCode: jest.fn().mockImplementation(() => ''),
    getLogs: jest.fn().mockImplementation(() => []),
    getTransactionReceipt: jest.fn().mockImplementation(() => transactionReceiptMock),
    getTransactionCount: jest.fn().mockImplementation(() => 1),
    callContractMethod: jest.fn().mockImplementation(() => []),
} as any;
