import { AgendaMock } from './agenda.mock';
import { PluginManager } from '@applicature/synth.plugin-manager';

export const PluginManagerMock = {
    getJobExecutor: jest.fn().mockImplementation(() => AgendaMock)
} as any as PluginManager;
