import * as Joi from 'joi';

// tslint:disable-next-line
export namespace AddressValidation {
    export const GetAddressBalance = {
        params: {
            address: Joi.string().required()
        },
        query: {
            projectId: Joi.string().optional(),
            transportConnectionId: Joi.string().required(),
        }
    };
}
