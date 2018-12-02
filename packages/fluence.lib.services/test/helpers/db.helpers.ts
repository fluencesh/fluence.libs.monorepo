import { random } from 'lodash';
import { Dao } from '@applicature/synth.plugin-manager';
import { Db } from 'mongodb';

export async function clearCollections(db: Db, collections: Array<string>) {
    await Promise.all(
        collections.map((collection) => db.collection(collection).remove({}))
    );
}

export async function createEntities<T>(
    dao: Dao<any>,
    entityGenerator: () => T,
    target: Array<T>
) {
    for (let i = 0; i < target.length; i++) {
        const data = entityGenerator();
        target[i] = await dao.create(data);
    }
}

export function getRandomItem<T>(items: Array<T>, filter?: (item: T, index?: number, items?: Array<T>) => boolean): T {
    if (filter) {
        return items.filter(filter)[random(0, items.length - 1)];
    }

    return items[random(0, items.length - 1)];
}
