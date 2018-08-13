import { PluginManager } from '@fluencesh/multivest.core';
import { Plugin as MongoPlugin } from '@fluencesh/multivest.mongodb';

const generate = (n: number, f: any) => {
    return Array(n).fill('').map(f);
};

async function start() {
    const pluginManager = new PluginManager([
        {
            path: '@fluencesh/multivest.mongodb',
        }
    ]);

    await pluginManager.init();
    const mongoPlugin = pluginManager.get('mongodb') as any as MongoPlugin;
}

start();
