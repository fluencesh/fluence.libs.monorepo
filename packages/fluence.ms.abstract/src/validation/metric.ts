import * as Joi from 'joi';

// tslint:disable-next-line
export namespace MetricValidation {
    export const GetMetric = {
        query: {
            token: Joi.string().optional(),
        }
    };
}
