import openapi from "@wesleytodd/openapi";
import { BearerSecurityScheme, OAuth2SecurityScheme } from "./components.js";

const docs = openapi({
    openapi: "3.0.0",
    info: {
        title: "EnergiQ Payment APIs",
        version: "1.0.0",
        description: "Documentation for the EnergiQ Payment APIs - Transaction payment processing and management",
    },
});

docs.securitySchemes("BearerSecurityScheme", BearerSecurityScheme);
docs.securitySchemes("OAuth2SecurityScheme", OAuth2SecurityScheme);

export { docs }; 