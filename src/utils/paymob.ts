import config from "../config/env.js";
import { randomUUID } from "crypto";
import { Type, Static } from "@sinclair/typebox";
import logger from "./logging.js";

export const UserDataSchema = Type.Object({
    first_name: Type.String({
        minLength: 1,
        description: "User first name",
    }),
    last_name: Type.String({
        minLength: 1,
        description: "User last name",
    }),
    email: Type.String({
        format: "email",
        description: "User email address",
    }),
    phone_number: Type.Optional(Type.String({
        description: "User phone number",
    })),
});

export type UserData = Static<typeof UserDataSchema>;

class Paymob {
    private paymobBaseURL = "https://accept.paymob.com";
    private apiKey: string;
    private secretKey: string;
    private publicKey: string;
    private paymentMethods: number[];

    constructor() {
        this.apiKey = config.PAYMOB_API_KEY;
        this.secretKey = config.PAYMOB_SECRET_KEY;
        this.publicKey = config.PAYMOB_PUBLIC_KEY;
        this.paymentMethods = [config.PAYMOB_PAYMENT_METHOD];
    }

    /**
     * Creates a payment intention with Paymob for a transaction
     *
     * @param amount - The payment amount in EGP (will be converted to piasters by multiplying by 100)
     * @param user - The user object containing general information
     * @param transactionId - The transaction ID for reference
     * @returns Promise<string> - The payment intention URL that the user can use to complete payment
     * @throws Error - Throws an error if the payment intention creation fails
     */
    async createPaymentIntention(amount: number, user: UserData, transactionId: string): Promise<string> {
        try {
            const paymobIntentionReq = JSON.stringify({
                amount: amount * 100,
                currency: "EGP",
                payment_methods: this.paymentMethods,
                special_reference: transactionId,
                items: [
                    {
                        name: "charging session",
                        amount: amount * 100,
                        description: "successful charging session.",
                        quantity: 1,
                    },
                ],
                billing_data: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone_number: user.phone_number ?? "null",
                },
                customer: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                },
            });

            const response = await fetch(`${this.paymobBaseURL}/v1/intention/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${this.secretKey}`,
                },
                body: paymobIntentionReq,
            });

            if (!response.ok) {
                const error = await response.json();
                logger.error("Paymob API error:", error);
                throw new Error("PAYMOB_ERROR", { cause: error });
            }

            const data = (await response.json()) as { client_secret: string };
            return this.buildIntentionUrl(data.client_secret);
        } catch (error) {
            logger.error("Error creating payment intention:", error);
            throw error;
        }
    }

    private buildIntentionUrl(client_secret: string): string {
        return `${this.paymobBaseURL}/unifiedcheckout/?publicKey=${this.publicKey}&clientSecret=${client_secret}`;
    }
}

export { Paymob }; 