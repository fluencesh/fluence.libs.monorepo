import { Hashtable } from '@applicature-private/multivest.core';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

export enum RequestType {
    POST,
    PUT,
    GET,
    DELETE,
    PATCH,
    OPTIONS,
    TRACE,
    CONNECT
}

export interface JsonRpcProxyResponse {
    statusCode: number;
    statusMessage: string;
    headers: Hashtable<string>;
    body: any;
}

export abstract class JsonRpcProxy {
    protected url: string;

    constructor(url: string) {
        this.url = url;
    }

    public abstract getValidationScheme(): Hashtable<object>;

    public async proxy(requestType: RequestType, path: string, headers: Hashtable<string>,
                       originalBody: string, body: any): Promise<JsonRpcProxyResponse> {

        const options: AxiosRequestConfig = {
            url: path,

            method: requestType.toString(),

            baseURL: this.url,

            headers,

            data: originalBody,

            timeout: 1000,
        };

        const populatedOptions = this.populateRequestOptions(options);

        const response: AxiosResponse = await axios(populatedOptions);

        return {
            body: response.data,
            headers: response.headers,
            statusCode: response.status,
            statusMessage: response.statusText,
        };
    }

    protected abstract populateRequestOptions(options: AxiosRequestConfig): AxiosRequestConfig;
}
