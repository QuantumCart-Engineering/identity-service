import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const createTestDatabase = async (): Promise<void> => {
    const databaseName = "identity_test_db";

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    try {
        await connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${databaseName}\``
        );

        console.log(
            `✅ Test database ready: ${databaseName}`
        );
    } finally {
        await connection.end();
    }
};

createTestDatabase().catch((error) => {
    console.error("❌ Failed to create test database");
    console.error(error);
    process.exit(1);
});