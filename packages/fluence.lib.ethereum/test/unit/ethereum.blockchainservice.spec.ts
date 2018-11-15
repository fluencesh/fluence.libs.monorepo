import { EthersEthereumTransportService } from '../../src/services/transports/ethers.ethereum.transport';
import { EthereumTopicFilter, EthereumTransaction } from '../../src/types';
import { ProviderMock } from '../mock/ethers.provider.mock';
import { PluginManagerMock } from '../mock/plugin.manager.mock';
import { TransportConnectionMock } from '../mock/transport.connection.mock';

describe('ethereum blockchain', () => {
    let transportService: EthersEthereumTransportService;

    beforeAll(async () => {
        transportService = new EthersEthereumTransportService(
            PluginManagerMock,
            TransportConnectionMock
        );

        (transportService as any).provider = ProviderMock;
    });

    beforeEach(() => {
        Object.keys(ProviderMock).forEach((key) => {
            const spy = ProviderMock[key] as jest.SpyInstance;
            spy.mockClear();
        });
    });

    it('should transfer correct params in `getBlock` (by number)', async () => {
        const height = 1;

        await transportService.getBlockByHeight(height);

        expect(ProviderMock.getBlock).toHaveBeenCalledWith(height);
        expect(ProviderMock.getBlock).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `getBlock` (by hash)', async () => {
        const hash = 'hash';

        await transportService.getBlockByHash(hash);

        expect(ProviderMock.getBlock).toHaveBeenCalledWith(hash);
        expect(ProviderMock.getBlock).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `getBlockNumber`', async () => {
       await transportService.getBlockHeight();

       expect(ProviderMock.getBlockNumber).toHaveBeenCalledWith();
       expect(ProviderMock.getBlockNumber).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `getTransaction`', async () => {
        const hash = 'hash';

        await transportService.getTransactionByHash(hash);
        
        expect(ProviderMock.getTransaction).toHaveBeenCalledWith(hash);
        expect(ProviderMock.getTransaction).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `sendTransaction`', async () => {
        const hash = 'hash';

        await transportService.sendRawTransaction(hash);
        
        expect(ProviderMock.sendTransaction).toHaveBeenCalledWith(hash);
        expect(ProviderMock.sendTransaction).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `getBalance`', async () => {
        const address = 'address';

        await transportService.getBalance(address, null);

        expect(ProviderMock.getBalance).toHaveBeenCalledWith(address);
        expect(ProviderMock.getBalance).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `sendRawTransaction`', async () => {
        const address = 'address';

        await transportService.sendRawTransaction(address, null);

        expect(ProviderMock.sendTransaction).toHaveBeenCalledWith(address);
        expect(ProviderMock.sendTransaction).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `estimateGas`', async () => {
        const tx = {
            to: [{ address: 'to', amount: 0 as any }],
            input: 'input',
            gasLimit: 'gasLimit' as any,
            gasPrice: 'gasPrice' as any,
            nonce: 0,
        } as EthereumTransaction;

        await transportService.estimateFee(tx);

        expect(ProviderMock.estimateGas).toHaveBeenCalledWith({
            data: tx.input,
            gasLimit: tx.gasLimit,
            gasPrice: tx.gasPrice,
            nonce: tx.nonce,
            to: tx.to[0].address,
            value: tx.to[0].amount
        });
        expect(ProviderMock.estimateGas).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `getGasPrice`', async () => {
        await transportService.getFeePrice();

        expect(ProviderMock.getGasPrice).toHaveBeenCalledWith();
        expect(ProviderMock.getGasPrice).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `getCode`', async () => {
        const address = 'address';
        await transportService.getCode(address);

        expect(ProviderMock.getCode).toHaveBeenCalledWith(address);
        expect(ProviderMock.getCode).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `getLogs`', async () => {
        const filters = { fromBlock: 1 } as EthereumTopicFilter;
        await transportService.getLogs(filters);

        expect(ProviderMock.getLogs).toHaveBeenCalledWith(filters);
        expect(ProviderMock.getLogs).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `getTransactionReceipt`', async () => {
        const hash = 'hash';

        await transportService.getTransactionReceipt(hash);

        expect(ProviderMock.getTransactionReceipt).toHaveBeenCalledWith(hash);
        expect(ProviderMock.getTransactionReceipt).toHaveBeenCalledTimes(1);
    });

    it('should transfer correct params in `getAddressTransactionsCount`', async () => {
        const address = 'address';
        const blockTag = 1;

        await transportService.getAddressTransactionsCount(address, blockTag);

        expect(ProviderMock.getTransactionCount).toHaveBeenCalledWith(address, blockTag);
        expect(ProviderMock.getTransactionCount).toHaveBeenCalledTimes(1);
    });
});
