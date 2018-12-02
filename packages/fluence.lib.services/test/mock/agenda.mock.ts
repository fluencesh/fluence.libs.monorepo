import * as Agenda from 'agenda';
import { v1 } from 'uuid';

export const JobMock = {
    save: jest.fn().mockImplementation((): Promise<void> => Promise.resolve()),
    attrs: {
        _id: {
            toHexString: jest.fn().mockImplementation(() => v1())
        }
    }
};

export const AgendaMock = {
    every: jest.fn().mockImplementation((): undefined => undefined),
    define: jest.fn().mockImplementation((): undefined => undefined),
    cancel: jest.fn().mockImplementation((params: any, cb: () => undefined) => cb()),
    create: jest.fn().mockImplementation(() => JobMock)
} as any as Agenda;
