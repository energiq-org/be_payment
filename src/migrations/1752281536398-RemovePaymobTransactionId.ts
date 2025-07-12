import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePaymobTransactionId1752281536398 implements MigrationInterface {
    name = 'RemovePaymobTransactionId1752281536398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_payments" DROP COLUMN "paymob_transaction_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_payments" ADD "paymob_transaction_id" character varying`);
    }

}
