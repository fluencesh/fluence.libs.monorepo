import { PluginManager } from '@applicature-private/multivest.core';
import { Plugin as MongoPlugin } from '@applicature-private/multivest.mongodb';

const generate = (n: number, f: any) => {
    return Array(n).fill('').map(f);
};

async function start() {
    const pluginManager = new PluginManager([
        {
            path: '@applicature-private/multivest.mongodb',
        }
    ]);

    await pluginManager.init();
    const mongoPlugin = pluginManager.get('mongodb') as any as MongoPlugin;
}

start();
