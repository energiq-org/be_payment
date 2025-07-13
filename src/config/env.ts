import "dotenv/config";
import { cleanEnv, str, num, bool } from "envalid";

const config = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ["development", "test", "production"] }),
    LISTEN_PORT: num(),
    JWT_SECRET: str(),
    DB_HOST: str(),
    DB_PORT: num(),
    DB_USERNAME: str(),
    DB_PASSWORD: str(),
    DB_NAME: str(),
    HTTP_LOGGING: bool({ default: false }),
    HTTP_BODY_LOGGING: bool({ default: false }),
    ACCESS_TOKEN_LIFETIME: str({ default: "15m" }),
    PAYMENT_WEBHOOK_SECRET: str({ default: "webhook_secret" }),
    PAYMOB_API_KEY: str(),
    PAYMOB_SECRET_KEY: str(),
    PAYMOB_PUBLIC_KEY: str(),
    PAYMOB_PAYMENT_METHOD: num(),
});

export default config; 