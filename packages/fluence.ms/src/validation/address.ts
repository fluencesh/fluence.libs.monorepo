import * as Joi from 'joi';

export namespace AddressValidation {
    export const GetAddressBalance = {
        params: {
            address: Joi.string().required()
        },
        query: {
            projectId: Joi.string().optional(),
            token: Joi.string().optional()
        }
    };
}
