import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymobTransactionId1752281075310 implements MigrationInterface {
    name = 'AddPaymobTransactionId1752281075310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_payments" ADD "paymob_transaction_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_payments" DROP COLUMN "paymob_transaction_id"`);
    }

}
