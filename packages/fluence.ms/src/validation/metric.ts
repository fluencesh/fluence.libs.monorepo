import * as Joi from 'joi';

export namespace MetricValidation {
    export const GetMetric = {
        query: {
            token: Joi.string().optional(),
        }
    };
}
