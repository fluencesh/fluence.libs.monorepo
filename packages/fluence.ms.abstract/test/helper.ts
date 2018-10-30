import { Constructable } from '@applicature-private/core.plugin-manager';
import { MongoDBDao } from '@applicature-private/core.mongodb';
import * as config from 'config';
import { random } from 'lodash';
import { MongoClient } from 'mongodb';
import { generate } from 'randomstring';
import { v1 as generateId } from 'uuid';
import { PrometheusMetric } from '../src';

export function generateRandomPrometheusMetric(): PrometheusMetric {
    return {
        id: generateId(),
        name: generate(),
        value: random(0, 1000)
    };
}

export async function clearDb(collections: Array<string>, db?: any) {
    db = db || await MongoClient.connect(config.get('multivest.mongodb.url'), {});

    await Promise.all(
        collections.map((collection) => db.collection(collection).remove({}))
    );

    await db.close();
}

let connection: MongoClient;
export async function constructDao<T extends MongoDBDao<any>>(daoConstructor: Constructable<T>): Promise<T> {
    if (!connection) {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
    }

    const dao = new daoConstructor(connection);
    return dao;
}

export async function createEntities(
    dao: MongoDBDao<any>,
    entityGenerator: () => object,
    target: Array<any>
) {
    await dao.remove({});

    for (let i = 0; i < target.length; i++) {
        const data = entityGenerator();
        target[i] = await dao.create(data);
    }
}

export function getRandomItem<T>(items: Array<T>): T {
    return items[random(0, items.length - 1)];
}
