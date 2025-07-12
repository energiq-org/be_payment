import { Repository } from "typeorm";
import { AppDataSource } from "../config/dbConnection.js";
import { TransactionPayment } from "../models/transactionPayment.js";
import { TransactionPaymentDetails, PaymentStatus, PaymentError } from "../types/payment.js";
import { PaymentClient } from "../clients/PaymentClient.js";
import logger from "../utils/logging.js";

export class PaymentRepository {
    private static instance: PaymentRepository;
    private repository: Repository<TransactionPayment>;
    private paymentClient: PaymentClient;

    private constructor() {
        this.repository = AppDataSource.getRepository(TransactionPayment);
        this.paymentClient = PaymentClient.getInstance();
    }

    public static getInstance(): PaymentRepository {
        if (!PaymentRepository.instance) {
            PaymentRepository.instance = new PaymentRepository();
        }
        return PaymentRepository.instance;
    }

    /**
     * Get transaction payment details by transaction ID
     */
    async getTransactionPaymentDetails(transactionId: string): Promise<TransactionPaymentDetails | null> {
        try {
            logger.info(`Getting payment details for transaction: ${transactionId}`);
            
            const transaction = await this.repository.findOne({
                where: { transaction_id: transactionId }
            });

            if (!transaction) {
                logger.warn(`Transaction payment not found: ${transactionId}`);
                return null;
            }

            return this.mapToTransactionPaymentDetails(transaction);
        } catch (error) {
            logger.error(`Error getting transaction payment details for ${transactionId}:`, error);
            throw new Error(`Failed to get transaction payment details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all payment transactions for a provider
     */
    async getProviderPaymentTransactions(providerId: string): Promise<TransactionPaymentDetails[]> {
        try {
            logger.info(`Getting payment transactions for provider: ${providerId}`);
            
            const transactions = await this.repository.find({
                where: { provider_id: providerId },
                order: { created_at: 'DESC' }
            });

            return transactions.map(transaction => this.mapToTransactionPaymentDetails(transaction));
        } catch (error) {
            logger.error(`Error getting provider payment transactions for ${providerId}:`, error);
            throw new Error(`Failed to get provider payment transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all payment transactions for a user
     */
    async getUserPaymentTransactions(userId: string): Promise<TransactionPaymentDetails[]> {
        try {
            logger.info(`Getting payment transactions for user: ${userId}`);
            
            const transactions = await this.repository.find({
                where: { user_id: userId },
                order: { created_at: 'DESC' }
            });

            return transactions.map(transaction => this.mapToTransactionPaymentDetails(transaction));
        } catch (error) {
            logger.error(`Error getting user payment transactions for ${userId}:`, error);
            throw new Error(`Failed to get user payment transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create or update a transaction payment
     * Flow: PENDING → putTransactionPayment
     */
    async putTransactionPayment(transactionDetails: TransactionPaymentDetails): Promise<PaymentError | null> {
        try {
            logger.info(`Putting transaction payment: ${transactionDetails.transaction_id}`);

            // Get transaction amount from client
            const amount = await this.paymentClient.getTransactionAmount(transactionDetails.transaction_id);

            const transactionPayment = this.repository.create({
                transaction_id: transactionDetails.transaction_id,
                provider_id: transactionDetails.provider_id,
                user_id: transactionDetails.user_id,
                cp_id: transactionDetails.cp_id,
                payment_status: PaymentStatus.PENDING,
                amount: amount
            });

            await this.repository.save(transactionPayment);
            
            logger.info(`Transaction payment created successfully: ${transactionDetails.transaction_id}`);
            return null; // No error
        } catch (error) {
            logger.error(`Error putting transaction payment for ${transactionDetails.transaction_id}:`, error);
            return {
                message: `Failed to create transaction payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
                code: 'PUT_TRANSACTION_ERROR'
            };
        }
    }

    /**
     * Process payment for a transaction
     * Flow: IN PROGRESS → payTransaction
     */
    async payTransaction(transactionId: string): Promise<string> {
        try {
            logger.info(`Processing payment for transaction: ${transactionId}`);

            const transaction = await this.repository.findOne({
                where: { transaction_id: transactionId }
            });

            if (!transaction) {
                throw new Error(`Transaction not found: ${transactionId}`);
            }

            // Update status to IN_PROGRESS
            transaction.payment_status = PaymentStatus.IN_PROGRESS;
            await this.repository.save(transaction);

            // Mock payment URL generation (replace with actual payment provider integration)
            const paymentUrl = `https://payment.energiq.com/pay/${transactionId}?amount=${transaction.amount}`;

            logger.info(`Payment processed for transaction ${transactionId}, payment URL: ${paymentUrl}`);
            return paymentUrl;
        } catch (error) {
            logger.error(`Error processing payment for ${transactionId}:`, error);
            throw new Error(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update payment status (for webhook handling)
     * Flow: DONE, FAILED → on webhook
     */
    async updatePaymentStatus(transactionId: string, status: PaymentStatus): Promise<PaymentError | null> {
        try {
            logger.info(`Updating payment status for transaction ${transactionId} to ${status}`);

            const transaction = await this.repository.findOne({
                where: { transaction_id: transactionId }
            });

            if (!transaction) {
                return {
                    message: `Transaction not found: ${transactionId}`,
                    code: 'TRANSACTION_NOT_FOUND'
                };
            }

            transaction.payment_status = status;
            await this.repository.save(transaction);

            logger.info(`Payment status updated successfully for transaction: ${transactionId}`);
            return null; // No error
        } catch (error) {
            logger.error(`Error updating payment status for ${transactionId}:`, error);
            return {
                message: `Failed to update payment status: ${error instanceof Error ? error.message : 'Unknown error'}`,
                code: 'UPDATE_STATUS_ERROR'
            };
        }
    }

    /**
     * Get transaction amount from payment client
     */
    async getTransactionAmount(transactionId: string): Promise<number | null> {
        try {
            logger.info(`Getting transaction amount for: ${transactionId}`);
            
            const amount = await this.paymentClient.getTransactionAmount(transactionId);
            
            logger.info(`Transaction amount retrieved: ${amount} EGP for transaction ${transactionId}`);
            return amount;
        } catch (error) {
            logger.error(`Error getting transaction amount for ${transactionId}:`, error);
            return null;
        }
    }

    /**
     * Helper method to map database entity to interface
     */
    private mapToTransactionPaymentDetails(transaction: TransactionPayment): TransactionPaymentDetails {
        return {
            transaction_id: transaction.transaction_id,
            provider_id: transaction.provider_id,
            user_id: transaction.user_id,
            cp_id: transaction.cp_id,
            payment_status: transaction.payment_status,
            amount: transaction.amount,
            created_at: transaction.created_at
        };
    }
} 