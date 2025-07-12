import { Type } from "@sinclair/typebox";

const successResponseSchema = Type.Object({
    message: Type.String(),
});

const badRequestErrorSchema = Type.Object({
    error: Type.String(),
});

const forbiddenErrorSchema = Type.Object({
    error: Type.String(),
});

const internalServerErrorSchema = Type.Object({
    error: Type.String(),
});

const notFoundErrorSchema = Type.Object({
    error: Type.String(),
});

const unauthorizedErrorSchema = Type.Object({
    error: Type.String(),
});

const conflictErrorSchema = Type.Object({
    error: Type.String(),
});

const goneErrorSchema = Type.Object({
    error: Type.String(),
});

export {
    badRequestErrorSchema,
    conflictErrorSchema,
    forbiddenErrorSchema,
    goneErrorSchema,
    internalServerErrorSchema,
    notFoundErrorSchema,
    successResponseSchema,
    unauthorizedErrorSchema,
}; 