import { Response } from 'express';

export const ResponseMock: Response = {
    end: jest.fn().mockImplementation(() => undefined),
    json: jest.fn().mockImplementation(() => undefined),
    send: jest.fn().mockImplementation(() => undefined),
    set: jest.fn().mockImplementation(() => ResponseMock),
    status: jest.fn().mockImplementation(() => ResponseMock),
} as any;
