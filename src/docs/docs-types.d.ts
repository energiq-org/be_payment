/* eslint-disable no-unused-vars */
type SecuritySchemeType = "apiKey" | "http" | "oauth2" | "openIdConnect";

interface SecuritySchemeObject {
    type: SecuritySchemeType;
    description?: string;
    name?: string;
    in?: "query" | "header" | "cookie";
    scheme?: string;
    bearerFormat?: string;
    flows?: {
        implicit?: OAuth2FlowObject;
        password?: OAuth2FlowObject;
        clientCredentials?: OAuth2FlowObject;
        authorizationCode?: OAuth2FlowObject;
    };
    openIdConnectUrl?: string;
}

interface OAuth2FlowObject {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes: { [scope: string]: string };
}

type SchemaObject = {
    type?: string;
    properties?: Record<string, SchemaObject>;
    items?: SchemaObject;
    $ref?: string;
    required?: string[];
    format?: string;
    description?: string;
    enum?: string[];
    minimum?: number;
    maximum?: number;
    pattern?: string;
    additionalProperties?: boolean | SchemaObject;
    allOf?: SchemaObject[];
    anyOf?: SchemaObject[];
    oneOf?: SchemaObject[];
    [key: string]: unknown;
};

type ParameterObject = {
    name: string;
    in: "query" | "header" | "path" | "cookie";
    description?: string;
    required?: boolean;
    schema: SchemaObject;
};

type RequestBodyObject = {
    description?: string;
    required?: boolean;
    content: {
        [mediaType: string]: {
            schema: SchemaObject;
        };
    };
};

type ResponseObject = {
    description?: string;
    content: {
        [mediaType: string]: {
            schema: SchemaObject;
        };
    };
};

type PathMethodObject = {
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: ParameterObject[];
    requestBody?: RequestBodyObject;
    responses?: {
        [statusCode: string]: ResponseObject;
    };
    tags?: string[];
    security?: Array<{
        [scheme: string]: string[];
    }>;
};

declare module "@wesleytodd/openapi" {
    interface InfoObject {
        title: string;
        description?: string;
        version: string;
        termsOfService?: string;
        contact?: {
            name?: string;
            url?: string;
            email?: string;
        };
        license?: {
            name: string;
            url?: string;
        };
    }

    interface OpenAPIConfig {
        openapi: "3.0.0" | "3.0.1" | "3.0.2" | "3.0.3" | "3.1.0";
        info: InfoObject;
        servers?: Array<{
            url: string;
            description?: string;
        }>;
        security?: Array<{
            [scheme: string]: string[];
        }>;
        tags?: Array<{
            name: string;
            description?: string;
        }>;
    }

    interface OpenAPI {
        options: {
            basePath: string;
        };
        document: object;
        generateDocument(document: object, _router: Express.Router, basePath: string): OpenAPI;
        (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
        path(config: PathMethodObject): import("express").RequestHandler;
        securitySchemes(name: string, schemes: SecuritySchemeObject): void;
        swaggerui(): import("express").RequestHandler;
    }

    export default function openapi(config: OpenAPIConfig): OpenAPI;
} 