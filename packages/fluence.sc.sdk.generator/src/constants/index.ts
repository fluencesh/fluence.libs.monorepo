export const sdkTemplateTs =
`import { EthereumService } from '@applicature-private/fluence.sdk.js';

export class <%= className %> {
    private ethereumService: EthereumService;
    private contractId: string;
    private transportConnectionId: string;

    constructor(
        baseUrl: string,
        authToken: string,
        authClientId: string,
        authProjectId: string,

        contractId: string,
        transportConnectionId: string
    ) {
        this.transportConnectionId = transportConnectionId;
        this.ethereumService = new EthereumService(baseUrl, authToken, authClientId, authProjectId);

        this.contractId = contractId;
    }
    <% _.forEach(methods, function({ name, inputTypes, methodParamsSignature }) { %>
    public <%= name %>(<%= methodParamsSignature %>): Promise<any> {
        const values = [];
        for (const value of arguments) {
            values.push(value);
        }

        return this.ethereumService.executeContractsMethod(
            this.contractId,
            '<%= name %>',
            [ <%= inputTypes %> ],
            values,
            this.transportConnectionId
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
        transportConnectionId: string
    );
    <% _.forEach(methods, function({ name, methodParamsSignature }) { %>
    public <%= name %>(<%= methodParamsSignature %>): Promise<any>;
    <% }); %>
}
`;
