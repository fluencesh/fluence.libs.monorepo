import * as Joi from 'joi';

// tslint:disable-next-line
export namespace TransactionValidation {
    export const Send = {
        body: {
            hex: Joi.string()
        },
        query: {
            clientId: Joi.string().required(),
            projectId: Joi.string().required(),
            transportConnectionId: Joi.string().required(),
        }
    };

    export const GetByHash = {
        query: {
            clientId: Joi.string().required(),
            projectId: Joi.string().required(),
            transportConnectionId: Joi.string().required(),
        }
    };
}