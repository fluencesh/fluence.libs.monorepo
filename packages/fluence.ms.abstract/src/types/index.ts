import { MultivestError } from '@applicature/synth.plugin-manager';
import { MongoScheme } from '@applicature/synth.mongodb';
import { Scheme } from '@fluencesh/fluence.lib.services';
import { OptionsJson } from 'body-parser';
import { NextFunction, Request, Response, Router } from 'express';

export interface ProjectSession extends Scheme.Session {
    project: Scheme.Project;
    client: Scheme.Client;
}

export interface AuthenticatedRequest extends Request {
    project?: Scheme.Project;
    relatedClient: Scheme.Client;
    session: ProjectSession;
}

export interface AwsAuthenticatedRequest extends AuthenticatedRequest {
    apiGateway: AwsRequestGateway;
}

export interface AwsRequestGateway {
    event: AwsGatewayEvent;
    context: AwsGatewayContext;
}

export interface AwsGatewayContext {
    client?: Scheme.Client;
    project?: Scheme.Project;
}

export interface AwsGatewayEvent {
    type: string;
    methodArn: string;
    resource: string;
    path: string;
    httpMethod: HttpMethod;
    headers: any;
    multiValueHeaders: any;
    queryStringParameters: any;
    multiValueQueryStringParameters: any;
    pathParameters: any;
    stageVariables: any;
    requestContext: AwsGatewayEventRequestContext;
}

export interface AwsGatewayEventRequestContext {
    path: string;
    accountId: number;
    resourceId: string;
    stage: string;
    requestId: string;
    identity: AwsGatewayIdentity;
    resourcePath: string;
    httpMethod: HttpMethod;
    extendedRequestId: string;
    apiId: string;
}

export interface AwsGatewayIdentity {
    sourceIp: string;
    apiKey: string;
    apiKeyId: string;
    userAgent: string;
}

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    PATCH = 'patch',
    DELETE = 'delete'
}

export enum SwResponseFormat {
    Buffer = 'buffer',
    Json = 'json'
}

export interface AwsRouter extends Router {
    handle: (req: Request, res: Response, next?: NextFunction) => void;
}

export interface AwsRequest extends Request {
    ctx: AwsContext;
}

export interface AwsResponse extends Response {
    throw: (err: MultivestError) => void;
}

export interface AwsCallData {
    method: HttpMethod;
    resource: string;
    body?: any;
}

export interface AwsHandlerResponse {
    status: number;
    body: any;
}

export interface AwsContext {
    getRemainingTimeInMillis: () => number;
    memoryLimitInMB: string;
    functionName: string;
    awsRequestId: string;
    logGroupName: string;
    logStreamName: string;
    clientContext?: AwsClientContext;
    identity?: AwsIdentity;
}

export interface AwsClientContext {
    client: AwsClientContextInfo;
    Custom: any;
    env: AwsClientContextEnv;
}

export interface AwsClientContextInfo {
    installation_id: string;
    app_title: string;
    app_version_name: string;
    app_version_code: string;
    app_package_name: string;
}

export interface AwsClientContextEnv {
    platform_version: string;
    platform: string;
    make: string;
    model: string;
    locale: string;
}

export interface AwsIdentity {
    cognitoIdentityId: string;
    cognitoIdentityPoolId: string;
}

export type StdCallback = (err?: any, result?: any) => void;

export interface MiddlewareConfigScheme {
    bodyParser?: OptionsJson;
    swStats?: SwStatsConfig;
    timeout?: number;
    metrics?: MetricConfig;
}

export interface MetricConfig {
    /** API specification in swagger format */
    enable: boolean;
}

export interface SwStatsConfig {
    /** API specification in swagger format */
    swaggerSpec: any;
}

export interface PrometheusMetric extends MongoScheme {
    name: string;
    value: number;
}

export enum HttpRequestExecutionStatusMetricType {
    Success = 'SUCCESS',
    Fail = 'FAIL',
}
