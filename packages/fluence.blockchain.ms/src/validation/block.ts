import * as Joi from 'joi';

export namespace BlockValidation {
    export const Get = {
        query: {
            clientId: Joi.string().required(),
            hash: Joi.string().optional(),
            number: Joi.string().optional(),
            projectId: Joi.string().required(),
            transportConnectionId: Joi.string().required(),
        }
    };
}
