import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOrderId1752284205771 implements MigrationInterface {
    name = 'RemoveOrderId1752284205771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_payments" DROP COLUMN "order_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_payments" ADD "order_id" character varying`);
    }

}
