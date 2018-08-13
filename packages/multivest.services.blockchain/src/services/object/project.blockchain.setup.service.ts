import { Service } from '@fluencesh/multivest.core';
import { DaoIds } from '../../constants';
import { TransportConnectionDao } from '../../dao';
import { ProjectBlockchainSetupDao } from '../../dao/project.blockchain.setup.dao';
import { Scheme } from '../../types';

export class ProjectBlockchainSetupService extends Service {
    private setupDao: ProjectBlockchainSetupDao;
    private transportConnectionsDao: TransportConnectionDao;

    public async init() {
        this.setupDao = this.pluginManager.getDao(DaoIds.ProjectBlockchainSetup) as ProjectBlockchainSetupDao;
        this.transportConnectionsDao = this.pluginManager.getDao(DaoIds.TransportConnection) as TransportConnectionDao;
    }

    public getServiceId() {
        return 'project.blockchain.setup.service';
    }

    public createSetup(
        projectId: string,
        blockchainId: string,
        privateTransportConnectionId?: string
    ): Promise<Scheme.ProjectBlockchainSetup> {
        return this.setupDao.createSetup(projectId, blockchainId, privateTransportConnectionId);
    }

    public getById(setupId: string): Promise<Scheme.ProjectBlockchainSetup> {
        return this.setupDao.getById(setupId);
    }

    public getByIdAndProjectId(setupId: string, projectId: string): Promise<Scheme.ProjectBlockchainSetup> {
        return this.setupDao.getByIdAndProjectId(setupId, projectId);
    }

    public listByProjectId(projectId: string): Promise<Array<Scheme.ProjectBlockchainSetup>> {
        return this.setupDao.listByProjectId(projectId);
    }

    public listByProjectIdAndBlockchainId(
        projectId: string,
        blockchainId: string
    ): Promise<Array<Scheme.ProjectBlockchainSetup>> {
        return this.setupDao.listByProjectIdAndBlockchainId(projectId, blockchainId);
    }

    // THINK: ManagedBlockchainTransportService should somehow react on this event
    // (exclude removed transports from list?).
    public async setStatus(setupId: string, status: Scheme.ProjectBlockchainSetupStatus): Promise<void> {
        const promises = [ this.setupDao.setStatus(setupId, status) ];

        const setup = await this.setupDao.getById(setupId);
        if (setup.privateTransportConnectionId) {
            const transportConnectionStatus = status === Scheme.ProjectBlockchainSetupStatus.Enabled
                ? Scheme.TransportConnectionStatus.Enabled
                : Scheme.TransportConnectionStatus.Disabled;

            promises.push(
                this.transportConnectionsDao.setStatus(
                    setup.privateTransportConnectionId,
                    transportConnectionStatus
                )
            );
        }

        // FIXME: should be wrapped into transaction
        await Promise.all(promises);

        return;
    }

    // THINK: ManagedBlockchainTransportService should somehow react on this event
    // (exclude removed transports from list?).
    public async setStatusByProjectId(
        projectId: string,
        status: Scheme.ProjectBlockchainSetupStatus
    ): Promise<void> {
        const promises = [ this.setupDao.setStatusByProjectId(projectId, status) ];

        const setups = await this.setupDao.listByProjectId(projectId);
        const transportConIds = setups
            .map((setup) => setup.privateTransportConnectionId)
            .filter((id) => !!id);

        if (transportConIds.length) {
            const transportConnectionStatus = status === Scheme.ProjectBlockchainSetupStatus.Enabled
                ? Scheme.TransportConnectionStatus.Enabled
                : Scheme.TransportConnectionStatus.Disabled;

            promises.push(
                this.transportConnectionsDao.setStatusByIds(
                    transportConIds,
                    transportConnectionStatus
                )
            );
        }

        // FIXME: should be wrapped into transaction
        await Promise.all(promises);

        return;
    }

    // THINK: ManagedBlockchainTransportService should somehow react on this event
    // (exclude removed transports from list?).
    public async removeById(setupId: string): Promise<void> {
        const setup = await this.setupDao.getById(setupId);

        const promises = [ this.setupDao.removeById(setupId) ];
        if (setup.privateTransportConnectionId) {
            promises.push(this.transportConnectionsDao.removeById(setup.privateTransportConnectionId));
        }

        // FIXME: should be wrapped into transaction
        await Promise.all(promises);

        return;
    }

    // THINK: ManagedBlockchainTransportService should somehow react on this event
    // (exclude removed transports from list?).
    public async removeByProjectId(projectId: string): Promise<void> {
        const setups = await this.setupDao.listByProjectId(projectId);
        const transportConIds = setups
            .map((setup) => setup.privateTransportConnectionId)
            .filter((id) => !!id);
        
        const promises = [ this.setupDao.removeByProjectId(projectId) ];
        
        if (transportConIds.length) {
            promises.push(this.transportConnectionsDao.removeByIds(transportConIds));
        }

        // FIXME: should be wrapped into transaction
        await Promise.all(promises);

        return;
    }
}
