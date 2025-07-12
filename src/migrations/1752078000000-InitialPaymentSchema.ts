import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialPaymentSchema1752078000000 implements MigrationInterface {
    name = 'InitialPaymentSchema1752078000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum for payment status
        await queryRunner.query(`CREATE TYPE "payment_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'DONE', 'FAILED')`);
        
        // Create transaction_payments table
        await queryRunner.query(`
            CREATE TABLE "transaction_payments" (
                "transaction_id" uuid NOT NULL,
                "provider_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "cp_id" character varying NOT NULL,
                "payment_status" "payment_status_enum" NOT NULL DEFAULT 'PENDING',
                "amount" numeric(10,2),
                "payment_url" text,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_transaction_payments" PRIMARY KEY ("transaction_id")
            )
        `);

        // Create indices for better query performance
        await queryRunner.query(`CREATE INDEX "IDX_transaction_payments_provider_id" ON "transaction_payments" ("provider_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_payments_user_id" ON "transaction_payments" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_payments_payment_status" ON "transaction_payments" ("payment_status")`);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_payments_created_at" ON "transaction_payments" ("created_at")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indices
        await queryRunner.query(`DROP INDEX "IDX_transaction_payments_created_at"`);
        await queryRunner.query(`DROP INDEX "IDX_transaction_payments_payment_status"`);
        await queryRunner.query(`DROP INDEX "IDX_transaction_payments_user_id"`);
        await queryRunner.query(`DROP INDEX "IDX_transaction_payments_provider_id"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "transaction_payments"`);
        
        // Drop enum
        await queryRunner.query(`DROP TYPE "payment_status_enum"`);
    }
} 