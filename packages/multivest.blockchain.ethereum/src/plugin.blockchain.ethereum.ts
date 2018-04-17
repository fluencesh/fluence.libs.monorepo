import { Plugin, Service } from '@applicature/multivest.core';
import { EthereumBlockchainService } from './services/blockchain/ethereum';
import { ManagedEthereumTransportService } from './services/blockchain/managed.ethereum.transport.service';
import { ContractService } from './services/objects/contract.service';
import { EthersEthereumTransportService } from './services/transports/ethers.ethereum.transport';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {
        // FIXME: types troubles
        this.registerService(EthereumBlockchainService as any as typeof Service);
        this.registerService(ManagedEthereumTransportService as any as typeof Service);
        this.registerService(EthersEthereumTransportService as any as typeof Service);
        this.registerService(ContractService);
    }
}

export { EthereumBlockchainPlugin as Plugin };
