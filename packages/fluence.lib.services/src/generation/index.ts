import { Plugin as MongoPlugin } from '@applicature/core.mongodb';
import { PluginManager } from '@applicature/core.plugin-manager';

const generate = (n: number, f: any) => {
    return Array(n)
        .fill('')
        .map(f);
};

async function start() {
    const pluginManager = new PluginManager([
        {
            path: '@applicature/core.mongodb'
        },
        {
            path: '@applicature/core.dynamodb'
        }
    ]);

    await pluginManager.init();
    const mongoPlugin = (pluginManager.get('mongodb') as any) as MongoPlugin;
}

start();
