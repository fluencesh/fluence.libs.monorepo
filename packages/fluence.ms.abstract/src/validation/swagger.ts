import * as Joi from 'joi';

// tslint:disable-next-line
export namespace SwaggerValidation {
    export const GetSwaggerFile = {
        query: {
            format: Joi.string().optional(),
            projectId: Joi.string().optional(),
            token: Joi.string().optional(),
        }
    };
}
