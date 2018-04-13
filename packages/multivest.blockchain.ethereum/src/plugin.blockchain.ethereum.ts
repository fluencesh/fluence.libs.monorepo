import { Plugin } from '@applicature/multivest.core';
import { EthereumBlockchainService } from './services/blockchain/ethereum';
import { ManagedEthereumTransportService } from './services/blockchain/managed.ethereum.transport.service';
import { EthersEthereumTransportService } from './services/transports/ethers.ethereum.transport';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {
        // this.registerService(EthereumBlockchainService);
        // this.registerService(ManagedEthereumTransportService);
        // this.registerService(EthersEthereumTransportService);
    }
}

export { EthereumBlockchainPlugin as Plugin };
