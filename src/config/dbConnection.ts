import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "./env.js";
import { TransactionPayment } from "../models/transactionPayment.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [TransactionPayment],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
});

export async function initializeDatabase(): Promise<void> {
    try {
        await AppDataSource.initialize();
        console.log("Database connection initialized successfully");
    } catch (error) {
        console.error("Error during database initialization:", error);
        throw error;
    }
} 