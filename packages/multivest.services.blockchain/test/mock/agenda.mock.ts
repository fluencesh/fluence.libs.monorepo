import * as Agenda from 'agenda';

export const AgendaMock = {
    every: jest.fn().mockImplementation((): undefined => undefined),
    define: jest.fn().mockImplementation((): undefined => undefined),
    cancel: jest.fn().mockImplementation((params: any, cb: () => undefined) => cb())
} as any as Agenda;
