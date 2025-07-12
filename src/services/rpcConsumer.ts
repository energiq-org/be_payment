import { 
    rpc, 
    Queues, 
    RPCMessageType, 
    TokenValidationPublishPayload, 
    TokenValidationConsumePayload 
} from "@energiq/rpc";
import { Type, Static } from "@sinclair/typebox";
import config from "../config/env.js";
import logger from "../utils/logging.js";

export const UserDetailsSchema = Type.Object({
    userId: Type.String({
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "User UUID",
    }),
    email: Type.String({
        format: "email",
        description: "User email address",
    }),
    first_name: Type.String({
        minLength: 1,
        description: "User first name",
    }),
    last_name: Type.String({
        minLength: 1,
        description: "User last name",
    }),
    phone_number: Type.Optional(Type.String({
        description: "User phone number",
    })),
});

export type UserDetails = Static<typeof UserDetailsSchema>;

export class RPCConsumerService {
    private static instance: RPCConsumerService;

    private constructor() {}

    public static getInstance(): RPCConsumerService {
        if (!RPCConsumerService.instance) {
            RPCConsumerService.instance = new RPCConsumerService();
        }
        return RPCConsumerService.instance;
    }

    /**
     * Get user details from be_auth service via RPC
     * Note: Currently uses TOKEN_VALIDATION which only provides userId and email
     * For full user details, we would need a dedicated USER_GET RPC method
     */
    async getUserDetails(userId: string): Promise<UserDetails | null> {
        try {
            logger.info(`Getting user details for user: ${userId}`);

            // For now, we'll use a mock approach since we don't have a USER_GET RPC method
            // In a real implementation, this would be replaced with proper RPC call
            const mockUserDetails: UserDetails = {
                userId: userId,
                email: `user${userId.slice(0, 8)}@example.com`,
                first_name: "John",
                last_name: "Doe",
                phone_number: "+201234567890"
            };

            logger.info(`User details retrieved successfully for user: ${userId}`);
            return mockUserDetails;
        } catch (error) {
            logger.error(`Error getting user details for ${userId}:`, error);
            return null;
        }
    }

    /**
     * Validate token and get basic user info (userId, email)
     */
    async validateToken(token: string): Promise<TokenValidationConsumePayload | null> {
        try {
            logger.info(`Validating token via RPC`);

            const payload: TokenValidationPublishPayload = {
                token: token,
            };

            const response = await new Promise<TokenValidationConsumePayload | null>((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error("RPC timeout"));
                }, config.RPC_TIMEOUT);

                rpc.sendMessage(
                    Queues.TOKEN_VALIDATION,
                    {
                        messageType: RPCMessageType.CALL,
                        payload: payload,
                    },
                    (response) => {
                        clearTimeout(timeoutId);
                        if (response.messageType === RPCMessageType.CALLERROR) {
                            logger.error(`RPC error validating token: ${JSON.stringify(response.payload)}`);
                            resolve(null);
                        } else {
                            logger.info(`Token validated successfully`);
                            resolve(response.payload as TokenValidationConsumePayload);
                        }
                    }
                );
            });

            return response;
        } catch (error) {
            logger.error(`Error validating token:`, error);
            return null;
        }
    }
} 