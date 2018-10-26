export const sdkTemplateTs =
`import { EthereumService } from '@fluencesh/fluence.sdk.js';

export class <%= className %> {
    private ethereumService: EthereumService;
    private contractId: string;
    private networkId: string;

    constructor(
        baseUrl: string,
        authToken: string,
        authClientId: string,
        authProjectId: string,

        contractId: string,
        networkId: string
    ) {
        this.ethereumService = new EthereumService(baseUrl, authToken, authClientId, authProjectId);

        this.contractId = contractId;
        this.networkId = networkId;
    }
    <% _.forEach(methods, function({ name, inputTypes, methodParamsSignature }) { %>
    public <%= name %>(<%= methodParamsSignature %>): Promise<any> {
        const values = [];
        for (const value of arguments) {
            values.push(value);
        }

        return this.ethereumService.executeContractsMethod(
            this.networkId,
            this.contractId,
            '<%= name %>',
            [ <%= inputTypes %> ],
            values
        );
    }
    <% }); %>
}
`;

export const sdkDeclaration =
`declare class <%= className %> {
    constructor(
        baseUrl: string,
        authToken: string,
        authClientId: string,
        authProjectId: string,
        contractId: string,
        networkId: string
    );
    <% _.forEach(methods, function({ name, methodParamsSignature }) { %>
    public <%= name %>(<%= methodParamsSignature %>): Promise<any>;
    <% }); %>
}
`;
