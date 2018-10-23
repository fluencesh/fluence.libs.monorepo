export enum Errors {
    USERID_IS_NULL = 'USERID_IS_NULL',
    WRONG_NETWORK = 'WRONG_NETWORK',
    PROJECT_ID_IS_INVALID = 'PROJECT_ID_IS_INVALID',
    CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
    JWT_SECRET_IS_MISSED = 'JWT_SECRET_IS_MISSED',
    UNKNOWN_TOKEN_STRATEGY = 'UNKNOWN_TOKEN_STRATEGY',
    OUTDATED_TOKEN_DATA = 'OUTDATED_TOKEN_DATA',
    PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
    SUBSCRIBED_EVENTS_ARE_INVALID = 'SUBSCRIBED_EVENTS_ARE_INVALID',
    INVALID_CRON_EXPRESSION = 'INVALID_CRON_EXPRESSION',
    CLIENT_NOT_FOUND = 'CLIENT_NOT_FOUND',
    PROJECT_IS_INACTIVE = 'PROJECT_IS_INACTIVE',
    INVALID_JWT = 'INVALID_JWT',
    SERVICE_NOT_CONFIGURED_FOR_PROCESSING_JWT = 'SERVICE_NOT_CONFIGURED_FOR_PROCESSING_JWT',
    DB_EXECUTION_ERROR = 'DB_EXECUTION_ERROR',
    CANT_CREATE_AGENDA_JOB = 'CANT_CREATE_AGENDA_JOB',
    SPECIFIED_TRANSPORT_NOT_FOUND = 'SPECIFIED_TRANSPORT_NOT_FOUND',
    BLOCKCHAIN_SERVICE_DOES_NOT_IN_REGISTRY = 'BLOCKCHAIN_SERVICE_DOES_NOT_IN_REGISTRY',
}
