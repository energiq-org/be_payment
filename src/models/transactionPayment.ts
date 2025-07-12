import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    BaseEntity,
} from "typeorm";
import { PaymentStatus } from "../types/payment.js";

@Entity("transaction_payments")
export class TransactionPayment extends BaseEntity {
    @PrimaryColumn("uuid")
    transaction_id: string;

    @Column("uuid")
    provider_id: string;

    @Column("uuid")
    user_id: string;

    @Column("varchar")
    cp_id: string; // charging station id

    @Column({
        type: "enum",
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    payment_status: PaymentStatus;

    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    amount: number;

    @CreateDateColumn({ type: "timestamptz" })
    created_at: Date;
} 