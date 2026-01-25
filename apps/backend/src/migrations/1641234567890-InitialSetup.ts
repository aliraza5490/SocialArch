import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class InitialSetup1641234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: "user",
        columns: [
          {
            name: "ID",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "firstName",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "lastName",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "password",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "isEmailVerified",
            type: "boolean",
            default: false,
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
        indices: [
          new TableIndex({
            columnNames: ["email"],
            isUnique: true,
          }),
          new TableIndex({
            columnNames: ["createdAt"],
          }),
        ],
      }),
      true,
    );

    // Create auth_token table
    await queryRunner.createTable(
      new Table({
        name: "auth_token",
        columns: [
          {
            name: "ID",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "identifier",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "token",
            type: "text",
            isNullable: false,
          },
          {
            name: "type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "TTL",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
        indices: [
          new TableIndex({
            columnNames: ["identifier"],
          }),
          new TableIndex({
            columnNames: ["TTL"],
          }),
        ],
      }),
      true,
    );

    // Create login_log table
    await queryRunner.createTable(
      new Table({
        name: "login_log",
        columns: [
          {
            name: "ID",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "ip",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "count",
            type: "int",
            default: 1,
            isNullable: false,
          },
          {
            name: "blockedUntil",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
        indices: [
          new TableIndex({
            columnNames: ["ip"],
            isUnique: true,
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable("login_log");
    await queryRunner.dropTable("auth_token");
    await queryRunner.dropTable("user");
  }
}
