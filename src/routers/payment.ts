import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController.js";
import { docs } from "../docs/index.js";
import { generateJSONRequestBody, generateJSONResponse, getErrorResponses } from "../docs/helpers.js";
import {
    transactionPaymentDetailsSchema,
    createTransactionPaymentSchema,
    paymentUrlResponseSchema,
    transactionListResponseSchema,
    PaymobWebhookPayloadSchema,
} from "../schemas/payment.js";
import { successResponseSchema } from "../schemas/common-responses.js";

const paymentRouter = Router();
const paymentController = new PaymentController();

// Get transaction payment details
paymentRouter.get(
    "/transactions/:transactionId",
    docs.path({
        summary: "Get transaction payment details",
        description: "Retrieve payment details for a specific transaction",
        tags: ["Payments"],
        responses: {
            200: generateJSONResponse(transactionPaymentDetailsSchema, "Transaction payment details retrieved successfully"),
            ...getErrorResponses(["400", "404", "500"]),
        },
    }),
    paymentController.getTransactionPaymentDetails.bind(paymentController)
);

// Get provider payment transactions
paymentRouter.get(
    "/providers/:providerId/transactions",
    docs.path({
        summary: "Get provider payment transactions",
        description: "Retrieve all payment transactions for a specific provider",
        tags: ["Payments"],
        responses: {
            200: generateJSONResponse(transactionListResponseSchema, "Provider transactions retrieved successfully"),
            ...getErrorResponses(["400", "500"]),
        },
    }),
    paymentController.getProviderPaymentTransactions.bind(paymentController)
);

// Get user payment transactions
paymentRouter.get(
    "/users/:userId/transactions",
    docs.path({
        summary: "Get user payment transactions",
        description: "Retrieve all payment transactions for a specific user",
        tags: ["Payments"],
        responses: {
            200: generateJSONResponse(transactionListResponseSchema, "User transactions retrieved successfully"),
            ...getErrorResponses(["400", "500"]),
        },
    }),
    paymentController.getUserPaymentTransactions.bind(paymentController)
);

// Create transaction payment (PENDING status)
paymentRouter.post(
    "/transactions",
    docs.path({
        summary: "Create transaction payment",
        description: "Create a new transaction payment record with PENDING status",
        tags: ["Payments"],
        requestBody: generateJSONRequestBody(createTransactionPaymentSchema, "Transaction payment data"),
        responses: {
            201: generateJSONResponse(successResponseSchema, "Transaction payment created successfully"),
            ...getErrorResponses(["400", "500"]),
        },
    }),
    paymentController.putTransactionPayment.bind(paymentController)
);

// Process payment (IN_PROGRESS status)
paymentRouter.post(
    "/transactions/:transactionId/pay",
    docs.path({
        summary: "Process payment",
        description: "Generate payment URL and set transaction status to IN_PROGRESS.",
        tags: ["Payments"],
        responses: {
            200: generateJSONResponse(paymentUrlResponseSchema, "Payment URL generated successfully"),
            ...getErrorResponses(["400", "404", "500", "502"]),
        },
    }),
    paymentController.payTransaction.bind(paymentController)
);

// Webhook endpoint for payment status updates
paymentRouter.post(
    "/webhook",
    docs.path({
        summary: "Payment webhook",
        description: "Webhook endpoint for receiving payment status updates from Paymob payment gateway",
        tags: ["Payments"],
        requestBody: generateJSONRequestBody(PaymobWebhookPayloadSchema, "Paymob webhook payload"),
        responses: {
            200: generateJSONResponse(successResponseSchema, "Webhook processed successfully"),
            ...getErrorResponses(["400", "500"]),
        },
    }),
    paymentController.handlePaymentWebhook.bind(paymentController)
);

export { paymentRouter };
