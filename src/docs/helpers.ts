/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
    badRequestErrorSchema,
    conflictErrorSchema,
    forbiddenErrorSchema,
    goneErrorSchema,
    internalServerErrorSchema,
    notFoundErrorSchema,
} from "../schemas/common-responses.js";
import { TSchema } from "@sinclair/typebox";

function generateJSONRequestBody<T extends TSchema>(schema: T, description?: string) {
    return {
        description,
        required: true,
        content: {
            "application/json": {
                schema,
            },
        },
    };
}

function generateRequestParameters(schema: TSchema, source: "query" | "path", required = false) {
    const parameters: Array<{
        in: typeof source;
        name: string;
        schema: { type: string };
        required: boolean;
        description: string;
    }> = [];

    const properties = schema.properties || {};
    for (const [key, value] of Object.entries(properties)) {
        parameters.push({
            in: source,
            name: key,
            schema: { type: (value as { type?: string }).type || "string" },
            required: required || schema.required?.includes(key) || false,
            description: (value as { description?: string }).description || `The ${key} parameter`,
        });
    }

    return parameters;
}

function generateJSONResponse<T extends TSchema>(schema: T, description?: string) {
    const convertedSchema = {
        ...schema,
        type: schema.type || (schema.properties ? "object" : "string"),
        ...(schema.items && { items: schema.items }),
        ...(schema.allOf && { allOf: schema.allOf }),
    };

    return {
        description,
        content: {
            "application/json": {
                schema: convertedSchema,
            },
        },
    };
}

function getErrorResponses(codes: string[]) {
    const responses = {};
    for (const code of codes) {
        switch (code) {
            case "400":
                responses[code] = generateJSONResponse(badRequestErrorSchema, "Bad request");
                break;
            case "403":
                responses[code] = generateJSONResponse(forbiddenErrorSchema, "Forbidden");
                break;
            case "404":
                responses[code] = generateJSONResponse(notFoundErrorSchema, "Not found");
                break;
            case "409":
                responses[code] = generateJSONResponse(conflictErrorSchema, "Conflict");
                break;
            case "410":
                responses[code] = generateJSONResponse(goneErrorSchema, "Gone");
                break;
            default:
                responses[code] = generateJSONResponse(internalServerErrorSchema, "Internal server error");
        }
    }
    return responses;
}

export {
    generateJSONRequestBody,
    generateJSONResponse,
    getErrorResponses,
    generateRequestParameters,
}; 