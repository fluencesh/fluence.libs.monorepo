import { Db } from 'mongodb';

export const DbMock = Object.create(Db);
DbMock.collection = (name: string) => {
    return CollectionMock;
};

export const CollectionMock = {
    aggregate: jest.fn().mockImplementation(() => ({
        toArray() {
            return Promise.resolve([{}]);
        }
    })),
    count: jest.fn().mockImplementation(() => Promise.resolve(0)),
    deleteMany: jest.fn().mockImplementation(() => Promise.resolve({})),
    find: jest.fn().mockImplementation(() => ({
        toArray() {
            return Promise.resolve([{}]);
        }
    })),
    findOne: jest.fn().mockImplementation(() => Promise.resolve({})),
    insertMany: jest.fn().mockImplementation(() => Promise.resolve({
        ops: [{}]
    })),
    insertOne: jest.fn().mockImplementation(() => Promise.resolve({
        ops: [{}]
    })),
    updateMany: jest.fn().mockImplementation(() => Promise.resolve({})),
    updateOne: jest.fn().mockImplementation(() => Promise.resolve({})),
};
