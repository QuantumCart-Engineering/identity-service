import fs from "fs";
import path from "path";

import pool from "../config/database";

const MIGRATIONS_DIR = path.join(
    process.cwd(),
    "migrations"
);

const runMigrations = async (): Promise<void> => {
    const connection = await pool.getConnection();

    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                migration_name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const files = fs
            .readdirSync(MIGRATIONS_DIR)
            .filter((file) => file.endsWith(".sql"))
            .sort();

        const [executedRows] = await connection.query(
            "SELECT migration_name FROM schema_migrations"
        );

        const executedMigrations = new Set(
            (executedRows as { migration_name: string }[])
                .map((row) => row.migration_name)
        );

        for (const file of files) {
            if (executedMigrations.has(file)) {
                console.log(`⏭️ Skipping ${file}`);
                continue;
            }

            console.log(`🚀 Running migration: ${file}`);

            const migrationPath = path.join(
                MIGRATIONS_DIR,
                file
            );

            const sql = fs.readFileSync(
                migrationPath,
                "utf-8"
            );

            await connection.beginTransaction();

            try {
                await connection.query(sql);

                await connection.query(
                    `
                    INSERT INTO schema_migrations (migration_name)
                    VALUES (?)
                    `,
                    [file]
                );

                await connection.commit();

                console.log(`✅ Completed migration: ${file}`);
            } catch (error) {
                await connection.rollback();
                throw error;
            }
        }

        console.log("✅ Database migrations completed");
    } finally {
        connection.release();
        await pool.end();
    }
};

runMigrations().catch((error) => {
    console.error("❌ Migration failed");
    console.error(error);
    process.exit(1);
});