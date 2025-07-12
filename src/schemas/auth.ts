import { Type } from "@sinclair/typebox";

// User schema for auth (simplified version)
const userSchema = Type.Object({
    id: Type.String({
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)",
    }),
    email: Type.String({
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        description: "Email address",
    }),
    first_name: Type.Optional(Type.String({ minLength: 3, maxLength: 255 })),
    last_name: Type.Optional(Type.String({ minLength: 3, maxLength: 255 })),
    phone_number: Type.Optional(Type.String({
        pattern: "^(?:\\+20[-]?|0)?1[0-9]{9}$",
        description: "Phone number (e.g., +201012345678)",
    })),
});

// Access token payload schema
const accessTokenPayloadSchema = Type.Object({
    id: userSchema.properties.id,
    email: userSchema.properties.email,
    first_name: Type.Optional(userSchema.properties.first_name),
    last_name: Type.Optional(userSchema.properties.last_name),
    phone_number: Type.Union([Type.Null(), userSchema.properties.phone_number]),
});

export { userSchema, accessTokenPayloadSchema }; 