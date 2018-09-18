import * as Joi from 'joi';

export namespace BlockValidation {
    export const Get = {
        query: {
            hash: Joi.string().optional(),
            number: Joi.string().optional(),
            projectId: Joi.string().optional(),
            transportConnectionId: Joi.string().optional()
        }
    };
}
