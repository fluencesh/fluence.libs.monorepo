import { MultivestError, PluginManager } from '@applicature/synth.plugin-manager';
import { WebMultivestError } from '@applicature/synth.web';
import { NextFunction } from 'express';
import { Errors } from '../errors';

export abstract class Controller {
    protected pluginManager: PluginManager;

    constructor(pluginManager: PluginManager) {
        this.pluginManager = pluginManager;
    }

    protected handleError(ex: WebMultivestError, next: NextFunction) {
        if (ex instanceof WebMultivestError) {
            return next(ex);
        } else {
            return next(new WebMultivestError(Errors.INTERNAL_SERVER_ERROR, 500));
        }
    }
}
