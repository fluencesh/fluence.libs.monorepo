import { Plugin as MongoPlugin } from '@applicature/synth.mongodb';
import { MultivestError, Service } from '@applicature/synth.plugin-manager';
import * as config from 'config';
import { createHash } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import { DaoIds } from '../../constants';
import { ClientDao } from '../../dao/client.dao';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { AddressSubscriptionService } from './address.subscription.service';
import { EthereumContractSubscriptionService } from './ethereum.contract.subscription.service';
import { OraclizeSubscriptionService } from './oraclize.subscription.service';
import { TransactionHashSubscriptionService } from './transaction.hash.subscription.service';
import { FabricContractCreationSubscriptionService } from './fabric.contract.creation.subscription.service';

export class ClientService extends Service {
    protected clientDao: ClientDao;
    protected addressSubscriptionService: AddressSubscriptionService;
    protected transactionHashSubscriptionService: TransactionHashSubscriptionService;
    protected contractSubscriptionService: EthereumContractSubscriptionService;
    protected oraclizeSubscriptionService: OraclizeSubscriptionService;
    protected fabricContractCreationService: FabricContractCreationSubscriptionService;
    
    private jwtExpiresInMs: number;
    private jwtSecret: string;
    private mayProcessJwt: boolean;

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as MongoPlugin;

        this.clientDao = await mongodbPlugin.getDao(DaoIds.Client) as ClientDao;

        this.addressSubscriptionService = this.pluginManager
            .getServiceByClass(AddressSubscriptionService);
        this.transactionHashSubscriptionService = this.pluginManager
            .getServiceByClass(TransactionHashSubscriptionService);
        this.contractSubscriptionService = this.pluginManager
            .getServiceByClass(EthereumContractSubscriptionService);
        this.oraclizeSubscriptionService = this.pluginManager
            .getServiceByClass(OraclizeSubscriptionService);
        this.fabricContractCreationService = this.pluginManager
            .getServiceByClass(FabricContractCreationSubscriptionService);
   
        if (
            config.has('multivest.clientVerification.jwt.expiresInMs')
            && config.has('multivest.clientVerification.jwt.secret')
        ) {
            this.mayProcessJwt = true;
            this.jwtExpiresInMs = config.get<number>('multivest.clientVerification.jwt.expiresInMs');
            this.jwtSecret = config.get<string>('multivest.clientVerification.jwt.secret');
        } else {
            this.mayProcessJwt = false;
        }
    }

    public getServiceId(): string {
        return 'object.clients';
    }

    public async createClient(
        email: string,
        password: string,
        isAdmin: boolean
    ): Promise<Scheme.Client> {
        const passwordHash = this.generatePasswordHash(password);

        return this.clientDao.createClient(email, passwordHash, isAdmin);
    }

    public async getById(clientId: string): Promise<Scheme.Client> {
        return this.clientDao.getById(clientId);
    }

    public getByEmail(email: string): Promise<Scheme.Client> {
        return this.clientDao.getByEmail(email);
    }

    public getByEmailAndPassword(email: string, password: string): Promise<Scheme.Client> {
        const passwordHash = this.generatePasswordHash(password);

        return this.clientDao.getByEmailAndPasswordHash(email, passwordHash);
    }

    public clientsList() {
        return this.clientDao.list({});
    }

    public async setStatus(clientId: string, status: Scheme.ClientStatus): Promise<void> {
        const isActive = status === Scheme.ClientStatus.Active;
        await Promise.all([
            this.clientDao.setStatus(clientId, status),
            this.modifySubscriptionStatus(clientId, isActive)
        ]);
    }

    public async setAdminStatus(clientId: string, isAdmin: boolean): Promise<void> {
        await this.clientDao.setAdminStatus(clientId, isAdmin);
    }

    public async verifyClient(jwt: string): Promise<void> {
        if (!this.mayProcessJwt) {
            throw new MultivestError(Errors.SERVICE_NOT_CONFIGURED_FOR_PROCESSING_JWT);
        }

        const clientId = this.tryParseJwtToClientId(jwt);
        const client = await this.clientDao.getById(clientId);
        if (!client) {
            throw new MultivestError(Errors.CLIENT_NOT_FOUND);
        }

        await this.clientDao.setVerificationStatus(clientId, true);
    }

    public convertClientIdToJwt(clientId: string): string {
        if (!this.mayProcessJwt) {
            throw new MultivestError(Errors.SERVICE_NOT_CONFIGURED_FOR_PROCESSING_JWT);
        }
        
        return sign({ clientId }, this.jwtSecret, { expiresIn: this.jwtExpiresInMs });
    }

    public async removeById(clientId: string): Promise<void> {
        await this.clientDao.removeById(clientId);
    }

    private tryParseJwtToClientId(jwt: string): string {
        if (!this.mayProcessJwt) {
            throw new MultivestError(Errors.SERVICE_NOT_CONFIGURED_FOR_PROCESSING_JWT);
        }

        try {
            const { clientId } = verify(jwt, this.jwtSecret) as { clientId: string };
            return clientId;
        } catch (ex) {
            throw new MultivestError(Errors.INVALID_JWT);
        }
    }

    private async modifySubscriptionStatus(clientId: string, isActive: boolean): Promise<any> {
        return Promise.all([
            this.addressSubscriptionService.setClientActive(clientId, isActive),
            this.transactionHashSubscriptionService.setClientActive(clientId, isActive),
            this.contractSubscriptionService.setClientActive(clientId, isActive),
            this.oraclizeSubscriptionService.setClientActive(clientId, isActive),
            this.fabricContractCreationService.setProjectActive(clientId, isActive),
        ]);
    }

    private generatePasswordHash(password: string): string {
        return createHash('sha1').update(password).digest('hex');
    }
}
