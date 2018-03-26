import { PluginManager } from '@applicature/multivest.core';
import { Plugin as MongoPlugin } from '@applicature/multivest.mongodb';

const generate = (n: number, f: any) => {
    return Array(n).fill('').map(f);
};

async function start() {
    const pluginManager = new PluginManager([
        {
            path: '@applicature/multivest.mongodb',
        },
        {
            path: '@applicature/multivest.mongodb.ico',
        },
    ]);

    await pluginManager.init();
    const mongoPlugin = pluginManager.get('mongodb') as MongoPlugin;
}

start();
