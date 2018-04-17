import { Plugin, Service } from '@applicature/multivest.core';
import { Plugin as MongodbPlugin } from '@applicature/multivest.mongodb';
import { ContractDao } from './dao/contract.dao';
import { MongoContractDao } from './dao/mongodb/contract.dao';
import { EthereumBlockchainService } from './services/blockchain/ethereum';
import { ManagedEthereumTransportService } from './services/blockchain/managed.ethereum.transport.service';
import { ContractService } from './services/objects/contract.service';
import { EthersEthereumTransportService } from './services/transports/ethers.ethereum.transport';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {
        const mongoDbPlugin: MongodbPlugin = this.pluginManager.get('mongodb') as any;
        mongoDbPlugin.addDao(MongoContractDao);

        // FIXME: types troubles (incorrect count of constructor args)
        // this.registerService(EthersEthereumTransportService);
        // this.registerService(ManagedEthereumTransportService);
        // this.registerService(EthereumBlockchainService);
        this.registerService(ContractService);
    }
}

export { EthereumBlockchainPlugin as Plugin };
