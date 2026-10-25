import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import type { RowDataPacket } from "mysql2";

import pool from "../config/database";

/**
 * Idempotent admin bootstrap.
 *
 * Creates (or promotes) a single ADMIN account using the credentials
 * supplied through the environment. Running it again with the same email
 * only re-asserts the ADMIN role, so it is safe to repeat.
 *
 * Required env:
 *   ADMIN_EMAIL
 *   ADMIN_PASSWORD
 *
 * Optional env:
 *   ADMIN_PHONE (default: 9000000000)
 *   ADMIN_FIRST_NAME (default: QuantumCart)
 *   ADMIN_LAST_NAME  (default: Admin)
 */

const BCRYPT_SALT_ROUNDS = 12;

const requireEnv = (name: string): string => {
    const value = process.env[name];

    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(
            `Missing required environment variable: ${name}`
        );
    }

    return value.trim();
};

const seedAdmin = async (): Promise<void> => {
    const email = requireEnv("ADMIN_EMAIL").toLowerCase();
    const password = requireEnv("ADMIN_PASSWORD");
    const phone = process.env.ADMIN_PHONE?.trim() || "9000000000";
    const firstName =
        process.env.ADMIN_FIRST_NAME?.trim() || "QuantumCart";
    const lastName =
        process.env.ADMIN_LAST_NAME?.trim() || "Admin";

    const [existing] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [email]
    );

    const existingAdmin = existing[0];

    if (existingAdmin) {
        await pool.query(
            "UPDATE users SET role = 'ADMIN' WHERE id = ?",
            [existingAdmin.id]
        );

        console.log(
            `✅ Promoted existing user to ADMIN: ${email}`
        );

        return;
    }

    const passwordHash = await bcrypt.hash(
        password,
        BCRYPT_SALT_ROUNDS
    );

    await pool.query(
        `INSERT INTO users
            (id, email, phone, password_hash, first_name, last_name, role)
         VALUES (?, ?, ?, ?, ?, ?, 'ADMIN')`,
        [
            randomUUID(),
            email,
            phone,
            passwordHash,
            firstName,
            lastName
        ]
    );

    console.log(`✅ Created ADMIN user: ${email}`);
};

seedAdmin()
    .then(async () => {
        await pool.end();
    })
    .catch(async (error) => {
        console.error("❌ Failed to seed admin user");
        console.error(error);
        await pool.end();
        process.exit(1);
    });
