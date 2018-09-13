import { MultivestError, PluginManager } from '@fluencesh/multivest.core';
import { NextFunction } from 'express';
import { Errors } from '../errors';

export abstract class Controller {
    protected pluginManager: PluginManager;

    constructor(pluginManager: PluginManager) {
        this.pluginManager = pluginManager;
    }

    protected handleError(ex: Error, next: NextFunction) {
        if (ex instanceof Error) {
            return next(ex);
        } else {
            return next(new MultivestError(Errors.INTERNAL_SERVER_ERROR, 500));
        }
    }
}
