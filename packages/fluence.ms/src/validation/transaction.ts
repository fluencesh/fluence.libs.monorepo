import * as Joi from 'joi';

export namespace TransactionValidation {
    export const Send = {
        body: {
            hex: Joi.string()
        },
        query: {
            projectId: Joi.string().optional(),
            token: Joi.string().optional()
        }
    };

    export const GetByHash = {
        query: {
            projectId: Joi.string().optional(),
            token: Joi.string().optional()
        }
    };

    export const GetReceipt = {
        params: {
            hash: Joi.string().required()
        },
        query: {
            projectId: Joi.string().optional(),
            token: Joi.string().optional()
        }
    };
}
