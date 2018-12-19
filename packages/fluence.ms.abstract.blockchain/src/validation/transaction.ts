import * as Joi from 'joi';

// tslint:disable-next-line
export namespace TransactionValidation {
    export const Send = {
        body: {
            hex: Joi.string()
        },
        query: {
            projectId: Joi.string().optional(),
            transportConnectionId: Joi.string().required(),
        }
    };

    export const GetByHash = {
        query: {
            projectId: Joi.string().optional(),
            transportConnectionId: Joi.string().required(),
        }
    };
}
