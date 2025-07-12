import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePaymentUrlAndUpdatedAt1752277123278 implements MigrationInterface {
    name = 'RemovePaymentUrlAndUpdatedAt1752277123278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_transaction_payments_provider_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_transaction_payments_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_transaction_payments_payment_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_transaction_payments_created_at"`);
        await queryRunner.query(`ALTER TABLE "transaction_payments" DROP COLUMN "payment_url"`);
        await queryRunner.query(`ALTER TABLE "transaction_payments" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TYPE "public"."payment_status_enum" RENAME TO "payment_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_payments_payment_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'DONE', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "transaction_payments" ALTER COLUMN "payment_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "transaction_payments" ALTER COLUMN "payment_status" TYPE "public"."transaction_payments_payment_status_enum" USING "payment_status"::"text"::"public"."transaction_payments_payment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "transaction_payments" ALTER COLUMN "payment_status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum_old" AS ENUM('PENDING', 'IN_PROGRESS', 'DONE', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "transaction_payments" ALTER COLUMN "payment_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "transaction_payments" ALTER COLUMN "payment_status" TYPE "public"."payment_status_enum_old" USING "payment_status"::"text"::"public"."payment_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "transaction_payments" ALTER COLUMN "payment_status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."transaction_payments_payment_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payment_status_enum_old" RENAME TO "payment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "transaction_payments" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "transaction_payments" ADD "payment_url" text`);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_payments_created_at" ON "transaction_payments" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_payments_payment_status" ON "transaction_payments" ("payment_status") `);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_payments_user_id" ON "transaction_payments" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_payments_provider_id" ON "transaction_payments" ("provider_id") `);
    }

}
