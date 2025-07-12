import express from "express";
import { apiReference } from "@scalar/express-api-reference";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { getThemeSync } from "@intelika/swagger-theme";
import config from "./config/env.js";
import { paymentRouter } from "./routers/payment.js";
import { docs } from "./docs/index.js";
import logger from "./utils/logging.js";

function createServer() {
    const server = express();

    server.use(cors());
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    if (config.HTTP_LOGGING) {
        server.use(morgan("dev"));
    }

    
    // Additional route for webhook compatibility (singular path)
    server.use("/api/v1/payment", paymentRouter);

    // Serve static files (including logo)
    server.use("/static", express.static("public"));

    // Generate OpenAPI documentation
    const openAPIDocs = docs.generateDocument(docs.document, server._router, docs.options.basePath);

    // Swagger UI and Scalar documentation
    server.use(
        "/docs/scalar",
        apiReference({
            spec: {
                content: openAPIDocs,
            },
        })
    );

    server.use(
        "/docs/swagger",
        swaggerUi.serve,
        swaggerUi.setup(openAPIDocs, {
            customCss: `
                ${getThemeSync().toString()}
                .swagger-ui .topbar { display: none !important; }
                .swagger-ui .info::before {
                    content: '';
                    display: block;
                    background-image: url('/static/logo.png');
                    background-repeat: no-repeat;
                    background-size: contain;
                    width: 160px;
                    height: 60px;
                    margin-bottom: 20px;
                }
            `,
        })
    );

    // Health check endpoint
    server.get("/health", (req, res) => {
        res.status(200).json({ 
            status: "healthy",
            service: "be_payment",
            timestamp: new Date().toISOString()
        });
    });

    // Root endpoint with API info
    server.get("/", (req, res) => {
        res.status(200).json({
            service: "EnergiQ Payment Service",
            version: "1.0.0",
            documentation: {
                swagger: "/docs/swagger",
                scalar: "/docs/scalar"
            },
            health: "/health"
        });
    });

    // 404 handler
    server.use("*", (req, res) => {
        logger.warn(`404 - Not Found: ${req.method} ${req.originalUrl}`);
        res.status(404).json({ error: "Not Found" });
    });

    // Error handler
    server.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        logger.error("Unhandled error:", err);
        res.status(500).json({ error: "Internal server error" });
    });

    return server;
}

export { createServer }; 