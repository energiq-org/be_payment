import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderId1752283757138 implements MigrationInterface {
    name = 'AddOrderId1752283757138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_payments" ADD "order_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_payments" DROP COLUMN "order_id"`);
    }

}
