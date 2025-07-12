import { TSchema } from "@sinclair/typebox";
import { Ajv } from "ajv";

const ajv = new Ajv();

function validateTypeboxSchema(input: unknown, schema: TSchema): { isValid: boolean; message?: string } {
    const validate = ajv.compile(schema);
    const valid = validate(input);
    if (!valid) {
        return { isValid: false, message: validate.errors?.[0]?.message };
    }
    return { isValid: true };
}

export { validateTypeboxSchema }; 