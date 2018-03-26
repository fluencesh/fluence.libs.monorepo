import * as faker from 'faker';
import { v1 as generateId } from 'uuid';

import { Scheme } from '../types';

export const randomJob = (): Scheme.Job => {
    const job: Scheme.Job = {
        id: faker.lorem.word(),
        params: {
            processedBlockHeight: faker.random.number({
                min: 100000,
                max: 1000000,
            })
        },
    };
    return job;
};
