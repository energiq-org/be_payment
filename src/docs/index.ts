import openapi from "@wesleytodd/openapi";

const docs = openapi({
    openapi: "3.0.0",
    info: {
        title: "EnergiQ Payment APIs",
        version: "1.0.0",
        description: "Documentation for the EnergiQ Payment APIs - Transaction payment processing and management",
    },
});

export { docs }; 