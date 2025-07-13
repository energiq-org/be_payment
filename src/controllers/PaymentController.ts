import { Request, Response } from "express";
import { PaymentRepository } from "../services/paymentRepository.js";
import { PaymentStatus } from "../types/payment.js";
import { Paymob, UserData } from "../utils/paymob.js";
import { PaymobWebhookPayloadSchema } from "../schemas/payment.js";
import { Static } from "@sinclair/typebox";
import logger from "../utils/logging.js";

export class PaymentController {
    private paymentRepository: PaymentRepository;
    private paymob: Paymob;

    constructor() {
        this.paymentRepository = PaymentRepository.getInstance();
        this.paymob = new Paymob();
    }

    /**
     * Get transaction payment details
     */
    async getTransactionPaymentDetails(req: Request, res: Response): Promise<void> {
        try {
            const { transactionId } = req.params;
            
            if (!transactionId) {
                res.status(400).json({ error: "Transaction ID is required" });
                return;
            }

            const paymentDetails = await this.paymentRepository.getTransactionPaymentDetails(transactionId);
            
            if (!paymentDetails) {
                res.status(404).json({ error: "Transaction payment not found" });
                return;
            }

            res.status(200).json(paymentDetails);
        } catch (error) {
            logger.error("Error getting transaction payment details:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    /**
     * Get provider payment transactions
     */
    async getProviderPaymentTransactions(req: Request, res: Response): Promise<void> {
        try {
            const { providerId } = req.params;
            
            if (!providerId) {
                res.status(400).json({ error: "Provider ID is required" });
                return;
            }

            const transactions = await this.paymentRepository.getProviderPaymentTransactions(providerId);
            res.status(200).json({ transactions });
        } catch (error) {
            logger.error("Error getting provider payment transactions:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    /**
     * Get user payment transactions
     */
    async getUserPaymentTransactions(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                res.status(400).json({ error: "User ID is required" });
                return;
            }

            const transactions = await this.paymentRepository.getUserPaymentTransactions(userId);
            res.status(200).json({ transactions });
        } catch (error) {
            logger.error("Error getting user payment transactions:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    /**
     * Create transaction payment (PENDING → putTransactionPayment)
     */
    async putTransactionPayment(req: Request, res: Response): Promise<void> {
        try {
            const { transaction_id, provider_id, user_id, cp_id } = req.body;

            if (!transaction_id || !provider_id || !user_id || !cp_id) {
                res.status(400).json({ 
                    error: "transaction_id, provider_id, user_id, and cp_id are required" 
                });
                return;
            }

            const transactionDetails = {
                transaction_id,
                provider_id,
                user_id,
                cp_id,
                payment_status: PaymentStatus.PENDING
            };

            const error = await this.paymentRepository.putTransactionPayment(transactionDetails);
            
            if (error) {
                res.status(400).json({ error: error.message });
                return;
            }

            res.status(201).json({ 
                message: "Transaction payment created successfully",
                transaction_id: transaction_id,
                payment_status: PaymentStatus.PENDING
            });
        } catch (error) {
            logger.error("Error creating transaction payment:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    /**
     * Process payment (IN PROGRESS → payTransaction)
     */
    async payTransaction(req: Request, res: Response): Promise<void> {
        try {
            const { transactionId } = req.params;
            
            if (!transactionId) {
                res.status(400).json({ error: "Transaction ID is required" });
                return;
            }

            // Get transaction details from database
            const transactionDetails = await this.paymentRepository.getTransactionPaymentDetails(transactionId);
            
            if (!transactionDetails) {
                res.status(404).json({ error: "Transaction not found" });
                return;
            }

            // Get transaction amount using the payment client
            const amount = await this.paymentRepository.getTransactionAmount(transactionId);
            
            if (!amount) {
                res.status(400).json({ error: "Could not retrieve transaction amount" });
                return;
            }

            // For now, use basic user data for payment
            // In a real implementation, this would come from the request payload or user service
            const userData: UserData = {
                first_name: "User",
                last_name: "Customer",
                email: `user-${transactionDetails.user_id.slice(0, 8)}@example.com`,
                phone_number: "+201234567890"
            };

            // Create payment intention with Paymob
            const paymentUrl = await this.paymob.createPaymentIntention(
                amount,
                userData,
                transactionId
            );

            // Update transaction status to IN_PROGRESS
            await this.paymentRepository.updatePaymentStatus(transactionId, PaymentStatus.IN_PROGRESS);
            
            res.status(200).json({ 
                payment_url: paymentUrl,
                transaction_id: transactionId,
                payment_status: PaymentStatus.IN_PROGRESS
            });
        } catch (error) {
            logger.error("Error processing payment:", error);
            if (error instanceof Error && error.message === "PAYMOB_ERROR") {
                res.status(502).json({ error: "Payment service unavailable" });
            } else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    }

    /**
     * Webhook handler for payment status updates (DONE, FAILED → on webhook)
     */
    async handlePaymentWebhook(req: Request, res: Response): Promise<void> {
        try {
            const webhookPayload = req.body as Static<typeof PaymobWebhookPayloadSchema>;

            // Log the webhook for debugging
            logger.info("Received Paymob webhook", {
                type: webhookPayload.type,
                transaction_id: webhookPayload.obj.id,
                success: webhookPayload.obj.success,
                order_id: webhookPayload.obj.order?.id,
            });

            // Only process transaction webhooks
            if (webhookPayload.type === "TRANSACTION") {
                const { obj: transactionData } = webhookPayload;

                // Extract transaction ID from special_reference (which we set during payment intention creation)
                const transactionId = transactionData.order?.merchant_order_id;
                
                if (!transactionId) {
                    logger.error("No transaction ID found in webhook payload");
                    res.status(200).json({ message: "Webhook received but no transaction ID found" });
                    return;
                }

                // Determine payment status based on Paymob success flag
                const paymentStatus = transactionData.success ? PaymentStatus.DONE : PaymentStatus.FAILED;

                // Update transaction status
                const error = await this.paymentRepository.updatePaymentStatus(transactionId, paymentStatus);
                
                if (error) {
                    logger.error(`Error updating payment status: ${error.message}`);
                    // Still return 200 to acknowledge webhook
                    res.status(200).json({ message: "Webhook received but status update failed" });
                    return;
                }

                logger.info("Payment webhook processed successfully", {
                    transaction_id: transactionId,
                    paymob_transaction_id: transactionData.id,
                    amount: transactionData.amount_cents,
                    status: paymentStatus,
                });

                res.status(200).json({ 
                    message: "Webhook processed successfully",
                    transaction_id: transactionId,
                    payment_status: paymentStatus
                });
                return;
            }

            // For non-transaction webhooks, just acknowledge
            logger.info("Non-transaction webhook received", { type: webhookPayload.type });
            res.status(200).json({ message: "Webhook received and acknowledged" });
            return;
        } catch (error) {
            logger.error("Error processing payment webhook:", error);
            // Always return 200 to Paymob to prevent retries for our internal errors
            res.status(200).json({ error: "Webhook processing failed but acknowledged" });
        }
    }
} 