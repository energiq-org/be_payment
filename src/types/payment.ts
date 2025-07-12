export enum PaymentStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS", 
    DONE = "DONE",
    FAILED = "FAILED"
}

export interface TransactionPaymentDetails {
    transaction_id: string;
    provider_id: string;
    user_id: string;
    cp_id: string; // charging station id
    payment_status: PaymentStatus;
    amount?: number; // in EGP
    created_at?: Date;
}

export interface PaymentError {
    message: string;
    code?: string;
} 