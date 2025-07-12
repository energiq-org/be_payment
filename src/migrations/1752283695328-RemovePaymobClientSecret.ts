import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePaymobClientSecret1752283695328 implements MigrationInterface {
    name = 'RemovePaymobClientSecret1752283695328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_payments" DROP COLUMN "paymob_client_secret"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_payments" ADD "paymob_client_secret" character varying`);
    }

}
