import * as express from 'express';
import { createServer, Server } from 'http';
import { promisify } from 'util';

export class App {
    private app: express.Application;
    private server: Server;

    private middlewares: Array<express.RequestHandler> = [];
    private routers: Array<{ router: express.Router, path?: string }> = [];
    private errorHandlers: Array<express.ErrorRequestHandler> = [];

    public get expressApp() {
        return this.app;
    }

    public addMiddleware(middleware: express.RequestHandler): void {
        this.middlewares.push(middleware);
    }

    public addRouter(router: express.Router, path?: string): void {
        this.routers.push({ router, path });
    }

    public addErrorHandler(errorHandler: express.ErrorRequestHandler): void {
        this.errorHandlers.push(errorHandler);
    }

    public async start(port: number): Promise<void> {
        this.buildApp();

        this.server = createServer(this.app);
        await promisify(this.server.listen).call(this.server, port);

        return;
    }

    public async stop(): Promise<void> {
        await promisify(this.server.close).call(this.server);

        this.app = null;

        return;
    }

    public buildApp(): express.Application {
        this.app = express();

        this.app.use(this.middlewares);

        this.routers.forEach((router) => {
            if (router.path) {
                this.app.use(router.path, router.router);
            } else {
                this.app.use(router.router);
            }
        });

        this.app.use(this.errorHandlers);

        return this.app;
    }
}
