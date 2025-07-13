import { Type } from "@sinclair/typebox";
import { UserDataSchema } from "../utils/paymob.js";

// Payment status enum schema
const paymentStatusSchema = Type.Union([
    Type.Literal("PENDING"),
    Type.Literal("IN_PROGRESS"),
    Type.Literal("DONE"),
    Type.Literal("FAILED")
]);

// Paymob webhook payload schema for validation
const PaymobWebhookPayloadSchema = Type.Object({
    type: Type.String(),
    obj: Type.Object({
        id: Type.Number(),
        success: Type.Boolean(),
        amount_cents: Type.Number(),
        currency: Type.String(),
        order: Type.Object({
            id: Type.Number(),
            merchant_order_id: Type.Union([Type.String(), Type.Null()]),
            amount_cents: Type.Number(),
            paid_amount_cents: Type.Number(),
            payment_status: Type.String(),
        }),
        payment_key_claims: Type.Object({
            user_id: Type.Number(),
            amount_cents: Type.Number(),
            currency: Type.String(),
            order_id: Type.Number(),
            billing_data: Type.Object({
                first_name: Type.String(),
                last_name: Type.String(),
                email: Type.String(),
                phone_number: Type.String(),
            }),
            integration_id: Type.Number(),
        }),
        created_at: Type.String(),
        is_live: Type.Boolean(),
    }),
});

// Transaction payment details schema
const transactionPaymentDetailsSchema = Type.Object({
    transaction_id: Type.String({
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)",
    }),
    provider_id: Type.String({
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "Provider UUID",
    }),
    user_id: Type.String({
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "User UUID",
    }),
    cp_id: Type.String({
        description: "Charging point/station ID",
    }),
    payment_status: paymentStatusSchema,
    amount: Type.Optional(Type.Number({
        minimum: 0,
        description: "Amount in EGP",
    })),
    created_at: Type.Optional(Type.String({
        format: "date-time",
        description: "Creation timestamp",
    })),
});

// Create transaction payment request schema
const createTransactionPaymentSchema = Type.Object({
    transaction_id: Type.String({
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "Transaction UUID",
    }),
    provider_id: Type.String({
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "Provider UUID",
    }),
    user_id: Type.String({
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "User UUID",
    }),
    cp_id: Type.String({
        description: "Charging point/station ID",
    }),
});

// Payment URL response schema
const paymentUrlResponseSchema = Type.Object({
    payment_url: Type.String({
        description: "URL for payment processing",
    }),
    transaction_id: Type.String({
        description: "Transaction UUID",
    }),
    payment_status: Type.Literal("IN_PROGRESS"),
});

// Transaction list response schema
const transactionListResponseSchema = Type.Object({
    transactions: Type.Array(transactionPaymentDetailsSchema),
});

// Webhook request schema (for manual webhook calls)
const webhookRequestSchema = Type.Object({
    transaction_id: Type.String({
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "Transaction UUID",
    }),
    payment_status: paymentStatusSchema,
});

export {
    paymentStatusSchema,
    transactionPaymentDetailsSchema,
    createTransactionPaymentSchema,
    paymentUrlResponseSchema,
    transactionListResponseSchema,
    webhookRequestSchema,
    PaymobWebhookPayloadSchema,
    UserDataSchema,
}; 