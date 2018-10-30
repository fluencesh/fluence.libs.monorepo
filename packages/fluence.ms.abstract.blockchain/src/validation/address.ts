import * as Joi from 'joi';

// tslint:disable-next-line
export namespace AddressValidation {
    export const GetAddressBalance = {
        params: {
            address: Joi.string().required()
        },
        query: {
            clientId: Joi.string().required(),
            projectId: Joi.string().required(),
            transportConnectionId: Joi.string().required(),
        }
    };
}