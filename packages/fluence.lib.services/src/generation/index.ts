import { Plugin as MongoPlugin } from '@applicature-private/core.mongodb';
import { PluginManager } from '@applicature-private/core.plugin-manager';

const generate = (n: number, f: any) => {
    return Array(n)
        .fill('')
        .map(f);
};

async function start() {
    const pluginManager = new PluginManager([
        {
            path: '@applicature-private/core.mongodb'
        },
        {
            path: '@applicature-private/core.dynamodb'
        }
    ]);

    await pluginManager.init();
    const mongoPlugin = (pluginManager.get('mongodb') as any) as MongoPlugin;
}

start();
