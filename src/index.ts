import { createServer } from "./app.js";
import { initializeDatabase } from "./config/dbConnection.js";
import config from "./config/env.js";
import logger from "./utils/logging.js";

const startServer = async () => {
    try {
        // Initialize database connection
        await initializeDatabase();
        
        // Create and start the server
        const server = createServer();
        server.listen(config.LISTEN_PORT);
        
        logger.info(`Payment service listening on http://localhost:${config.LISTEN_PORT}`);
        logger.info("Payment service started successfully");
    } catch (error) {
        logger.error(`Error starting payment service: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        process.exit(1);
    }
};

startServer().catch((err) => {
    logger.error(`Unhandled error during startup: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    process.exit(1);
}); 