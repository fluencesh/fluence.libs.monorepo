import * as Joi from 'joi';

// tslint:disable-next-line
export namespace BlockValidation {
    export const Get = {
        query: {
            hash: Joi.string().optional(),
            number: Joi.string().optional(),
            projectId: Joi.string().optional(),
            token: Joi.string().optional()
        }
    };
}